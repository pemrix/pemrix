//! Webhook service implementation.

use crate::{delivery::deliver, DeliveryResult, EventType, WebhookDelivery, WebhookSubscription};
use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::net::SocketAddr;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{info, warn};

/// Request to create a webhook subscription.
#[derive(Clone, Debug, Deserialize)]
pub struct SubscribeRequest {
    /// Target URL.
    pub url: String,
    /// Event types.
    pub events: Vec<EventType>,
    /// Optional secret. If omitted, a random secret is generated.
    pub secret: Option<String>,
}

/// Response containing subscription details.
#[derive(Clone, Debug, Serialize)]
pub struct SubscriptionResponse {
    /// Subscription ID.
    pub id: String,
    /// Target URL.
    pub url: String,
    /// Event types.
    pub events: Vec<EventType>,
    /// Webhook secret.
    pub secret: String,
}

impl From<WebhookSubscription> for SubscriptionResponse {
    fn from(sub: WebhookSubscription) -> Self {
        Self {
            id: sub.id.clone(),
            url: sub.url.clone(),
            events: sub.events.iter().copied().collect(),
            secret: sub.secret.clone(),
        }
    }
}

/// Shared webhook service state.
#[derive(Clone, Default, Debug)]
pub struct WebhookState {
    inner: Arc<Mutex<WebhookStateInner>>,
}

#[derive(Default, Debug)]
struct WebhookStateInner {
    subscriptions: HashMap<String, WebhookSubscription>,
    delivery_log: Vec<(String, DeliveryResult)>,
}

impl WebhookState {
    /// Create a new empty webhook state.
    pub fn new() -> Self {
        Self::default()
    }

    /// Add a subscription.
    pub async fn subscribe(&self, subscription: WebhookSubscription) {
        self.inner
            .lock()
            .await
            .subscriptions
            .insert(subscription.id.clone(), subscription);
    }

    /// Remove a subscription.
    pub async fn unsubscribe(&self, id: &str) -> Option<WebhookSubscription> {
        self.inner.lock().await.subscriptions.remove(id)
    }

    /// List active subscriptions.
    pub async fn list(&self) -> Vec<WebhookSubscription> {
        self.inner
            .lock()
            .await
            .subscriptions
            .values()
            .filter(|s| s.active)
            .cloned()
            .collect()
    }

    /// Trigger an event for all matching subscriptions.
    pub async fn trigger(&self, event_type: EventType, payload: serde_json::Value) {
        let subs = self.list().await;
        for sub in subs {
            if sub.events.contains(&event_type) {
                match WebhookDelivery::new(&sub, event_type, payload.clone()) {
                    Ok(delivery) => {
                        let result = deliver(&sub, &delivery).await;
                        self.inner
                            .lock()
                            .await
                            .delivery_log
                            .push((sub.id.clone(), result));
                    }
                    Err(e) => {
                        warn!("Failed to create webhook delivery: {}", e);
                    }
                }
            }
        }
    }
}

/// Webhook HTTP service.
#[derive(Clone, Debug)]
pub struct WebhookService {
    state: WebhookState,
    listen: String,
}

impl WebhookService {
    /// Create a new webhook service.
    pub fn new(listen: impl Into<String>) -> Self {
        Self {
            state: WebhookState::new(),
            listen: listen.into(),
        }
    }

    /// Access the webhook state.
    pub fn state(&self) -> &WebhookState {
        &self.state
    }

    /// Build the axum router.
    pub fn router(&self) -> Router {
        Router::new()
            .route("/webhooks/subscribe", post(subscribe_handler))
            .route("/webhooks/:id", delete(unsubscribe_handler))
            .route("/webhooks", post(list_handler))
            .with_state(self.state.clone())
    }

    /// Start the webhook HTTP server.
    pub async fn start(&self) -> Result<(), &'static str> {
        let addr: SocketAddr = self.listen.parse().map_err(|_| "invalid listen address")?;
        let listener = tokio::net::TcpListener::bind(addr)
            .await
            .map_err(|_| "failed to bind")?;
        info!("Webhook server listening on {}", addr);
        axum::serve(listener, self.router())
            .await
            .map_err(|_| "server error")?;
        Ok(())
    }
}

async fn subscribe_handler(
    State(state): State<WebhookState>,
    Json(request): Json<SubscribeRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let id = uuid::Uuid::new_v4().to_string();
    let secret = request
        .secret
        .unwrap_or_else(|| uuid::Uuid::new_v4().to_string());
    let events: HashSet<EventType> = request.events.into_iter().collect();
    let subscription = WebhookSubscription::new(id, request.url, events, secret);
    let response: SubscriptionResponse = subscription.clone().into();
    state.subscribe(subscription).await;
    Ok((StatusCode::CREATED, Json(response)))
}

async fn unsubscribe_handler(
    State(state): State<WebhookState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if state.unsubscribe(&id).await.is_some() {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    }
}

async fn list_handler(State(state): State<WebhookState>) -> impl IntoResponse {
    let subs: Vec<SubscriptionResponse> = state.list().await.into_iter().map(Into::into).collect();
    Json(subs)
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::{Request, StatusCode};
    use tower::ServiceExt;

    #[tokio::test]
    async fn subscribe_and_list() {
        let service = WebhookService::new("127.0.0.1:0");
        let app = service.router();
        let response = app
            .clone()
            .oneshot(
                Request::builder()
                    .uri("/webhooks/subscribe")
                    .method("POST")
                    .header("content-type", "application/json")
                    .body(Body::from(
                        r#"{"url":"https://example.com/hook","events":["block"]}"#,
                    ))
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), StatusCode::CREATED);
    }
}

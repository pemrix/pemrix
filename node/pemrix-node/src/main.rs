//! PEMRIX node binary entry point.
//!
//! Most users will use the `pemrix` CLI instead, but this binary is available
//! for direct node operation.

#[tokio::main]
async fn main() -> Result<(), pemrix_node::NodeError> {
    tracing_subscriber::fmt::init();
    pemrix_node::start("./pemrix-data").await
}

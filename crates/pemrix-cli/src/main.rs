//! PEMRIX command-line interface.
//!
//! Provides subcommands to initialize, start, and inspect a PEMRIX node.

use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing::{info, warn};

mod demo;

#[derive(Parser)]
#[command(name = "pemrix")]
#[command(about = "The PEMRIX network node CLI")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new PEMRIX node data directory.
    Init {
        /// Path to the node data directory.
        #[arg(short, long, default_value = "./pemrix-data")]
        data_dir: String,
    },
    /// Start the PEMRIX node.
    Start {
        /// Path to the node data directory.
        #[arg(short, long, default_value = "./pemrix-data")]
        data_dir: String,
    },
    /// Print basic node status.
    Status {
        /// Path to the node data directory.
        #[arg(short, long, default_value = "./pemrix-data")]
        data_dir: String,
    },
    /// Manage node keys.
    Keys {
        /// Path to the node data directory.
        #[arg(short, long, default_value = "./pemrix-data")]
        data_dir: String,
    },
    /// Run a local PEMRIX testnet with faucet, explorer, and webhooks.
    Testnet {
        /// Path to the testnet data directory.
        #[arg(short, long, default_value = "./pemrix-testnet-data")]
        data_dir: String,
        /// Number of validators to run in the local testnet.
        #[arg(short, long, default_value_t = 1)]
        validators: usize,
    },
    /// Run a wallet-to-merchant QR payment demo against a local testnet.
    Demo {
        /// RPC server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:60001")]
        rpc_url: String,
        /// Faucet server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:60101")]
        faucet_url: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Init { data_dir } => {
            info!("Initializing PEMRIX node at {}", data_dir);
            pemrix_node::init(&data_dir)?;
            info!("Node initialized successfully.");
        }
        Commands::Start { data_dir } => {
            info!("Starting PEMRIX node from {}", data_dir);
            pemrix_node::start(&data_dir).await?;
        }
        Commands::Status { data_dir } => {
            info!("PEMRIX node status for {}", data_dir);
            let status = pemrix_node::status(&data_dir)?;
            println!("{}", status);
        }
        Commands::Keys { data_dir } => {
            warn!("Key management is a stub in this release.");
            let keys = pemrix_node::keys(&data_dir)?;
            println!("{}", keys);
        }
        Commands::Testnet {
            data_dir,
            validators,
        } => {
            info!(
                "Starting PEMRIX local testnet in {} with {} validator(s)",
                data_dir, validators
            );
            pemrix_node::run_testnet(&data_dir, validators).await?;
        }
        Commands::Demo {
            rpc_url,
            faucet_url,
        } => {
            info!("Running PEMRIX wallet-to-merchant payment demo");
            demo::run(&rpc_url, &faucet_url).await?;
        }
    }

    Ok(())
}

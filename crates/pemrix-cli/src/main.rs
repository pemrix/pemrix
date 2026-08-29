//! PEMRIX command-line interface.
//!
//! Provides subcommands to initialize, start, and inspect a PEMRIX node.

use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing::info;

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
        /// Initialize as a validator and generate a validator keypair.
        #[arg(short, long, default_value_t = false)]
        validator: bool,
    },
    /// Start the PEMRIX node.
    Start {
        /// Path to the node data directory.
        #[arg(short, long, default_value = "./pemrix-data")]
        data_dir: String,
        /// Start in validator mode (requires a validator key in the data directory).
        #[arg(short, long, default_value_t = false)]
        validator: bool,
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
    /// Run shared services (RPC, faucet, explorer, webhooks) against a validator.
    Services {
        /// Validator RPC URL to poll for blocks and submit transactions.
        #[arg(short, long, default_value = "http://127.0.0.1:61001")]
        rpc_url: String,
    },
    /// Bootstrap a multi-validator BFT network from validator keys.
    BootstrapNetwork {
        /// Output directory for genesis and per-validator configs.
        #[arg(short, long, default_value = "./pemrix-network")]
        output_dir: String,
        /// Network chain ID.
        #[arg(short, long, default_value = "pemrix-main")]
        chain_id: String,
        /// Validator entries in the form `<validator_key.json_path>@<host:port>`.
        /// Repeat for each validator.
        #[arg(short, long, value_delimiter = ',', required = true)]
        validators: Vec<String>,
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
        #[arg(short, long, default_value = "http://127.0.0.1:61001")]
        rpc_url: String,
        /// Faucet server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:61003")]
        faucet_url: String,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();

    let cli = Cli::parse();

    match cli.command {
        Commands::Init {
            data_dir,
            validator,
        } => {
            info!("Initializing PEMRIX node at {}", data_dir);
            pemrix_node::init(&data_dir, validator)?;
            if validator {
                info!("Generating validator keypair");
                let key_file = pemrix_node::generate_validator_key(&data_dir)?;
                info!(
                    "Validator address: {}. Keep {} secret.",
                    key_file.address,
                    pemrix_node::ValidatorKeyFile::FILE_NAME
                );
            }
            info!("Node initialized successfully.");
        }
        Commands::Start {
            data_dir,
            validator,
        } => {
            info!("Starting PEMRIX node from {}", data_dir);
            if validator {
                pemrix_node::start_validator(&data_dir).await?;
            } else {
                pemrix_node::start(&data_dir).await?;
            }
        }
        Commands::Status { data_dir } => {
            info!("PEMRIX node status for {}", data_dir);
            let status = pemrix_node::status(&data_dir)?;
            println!("{}", status);
        }
        Commands::Keys { data_dir } => {
            let keys = pemrix_node::keys(&data_dir)?;
            println!("{}", keys);
        }
        Commands::Services { rpc_url } => {
            info!("Starting PEMRIX shared services against {}", rpc_url);
            pemrix_node::run_services(&rpc_url).await?;
        }
        Commands::BootstrapNetwork {
            output_dir,
            chain_id,
            validators,
        } => {
            info!("Bootstrapping PEMRIX BFT network in {}", output_dir);
            let entries: Vec<(String, String)> = validators
                .iter()
                .map(|s| {
                    let parts: Vec<&str> = s.splitn(2, '@').collect();
                    if parts.len() != 2 {
                        anyhow::bail!("invalid validator entry: {} (expected path@host:port)", s);
                    }
                    Ok((parts[0].to_string(), parts[1].to_string()))
                })
                .collect::<Result<Vec<_>, anyhow::Error>>()?;
            let manifest = pemrix_node::manifest_from_key_files(&entries)?;
            pemrix_node::bootstrap_bft_network(&chain_id, &manifest, &[], &output_dir)?;
            info!("Bootstrap complete. Copy validator-N directories to each host.");
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

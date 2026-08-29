//! PEMRIX command-line interface.
//!
//! Provides subcommands to initialize, start, and inspect a PEMRIX node.

use anyhow::{Context, Result};
use clap::{Parser, Subcommand};
use pemrix_primitives::Address;
use pemrix_sdk::{Client, HttpClient, Wallet};
use std::str::FromStr;
use tracing::info;

mod demo;

/// Encode a staking operation for the VM payload.
fn encode_staking_op(op: pemrix_vm::StakingOperation) -> Vec<u8> {
    let mut payload = vec![0x01];
    payload.extend_from_slice(&serde_json::to_vec(&op).expect("staking op serializes"));
    payload
}

/// Load a wallet from a PEMRIX key file.
fn wallet_from_key_file(path: &str) -> Result<Wallet> {
    let contents = std::fs::read_to_string(path)
        .with_context(|| format!("failed to read key file: {path}"))?;
    let key_file: pemrix_node::ValidatorKeyFile = serde_json::from_str(&contents)
        .with_context(|| format!("failed to parse key file: {path}"))?;
    let keypair = key_file.to_keypair()?;
    Ok(Wallet::from_keypair(keypair))
}

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
    /// Register the local validator key as an on-chain validator.
    RegisterValidator {
        /// Path to a PEMRIX key file (e.g. validator_key.json).
        #[arg(short, long)]
        key_file: String,
        /// RPC server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:61001")]
        rpc_url: String,
        /// Validator consensus public key, hex encoded.
        #[arg(short, long)]
        consensus_pubkey: String,
        /// Commission rate in basis points (0-10000).
        #[arg(short, long, default_value_t = 500)]
        commission_bps: u16,
        /// Amount of self-stake to lock.
        #[arg(short, long)]
        self_stake: u128,
        /// Transaction fee.
        #[arg(short, long, default_value_t = 1)]
        fee: u128,
    },
    /// Delegate tokens to a validator.
    Delegate {
        /// Path to a PEMRIX key file (e.g. validator_key.json).
        #[arg(short, long)]
        key_file: String,
        /// RPC server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:61001")]
        rpc_url: String,
        /// Validator address to delegate to.
        #[arg(short, long)]
        validator: String,
        /// Amount to delegate.
        #[arg(short, long)]
        amount: u128,
        /// Transaction fee.
        #[arg(short, long, default_value_t = 1)]
        fee: u128,
    },
    /// Undelegate tokens from a validator.
    Undelegate {
        /// Path to a PEMRIX key file (e.g. validator_key.json).
        #[arg(short, long)]
        key_file: String,
        /// RPC server URL.
        #[arg(short, long, default_value = "http://127.0.0.1:61001")]
        rpc_url: String,
        /// Validator address to undelegate from.
        #[arg(short, long)]
        validator: String,
        /// Amount to undelegate.
        #[arg(short, long)]
        amount: u128,
        /// Transaction fee.
        #[arg(short, long, default_value_t = 1)]
        fee: u128,
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
        Commands::RegisterValidator {
            key_file,
            rpc_url,
            consensus_pubkey,
            commission_bps,
            self_stake,
            fee,
        } => {
            info!("Registering validator via {}", rpc_url);
            let wallet = wallet_from_key_file(&key_file)?;
            let client = HttpClient::new(&rpc_url);
            let nonce = client.nonce(&wallet.address()).await?;
            let pubkey_bytes =
                hex::decode(&consensus_pubkey).with_context(|| "invalid consensus_pubkey hex")?;
            let payload = encode_staking_op(pemrix_vm::StakingOperation::RegisterValidator {
                consensus_pubkey: pubkey_bytes,
                commission_bps,
                self_stake,
            });
            let tx = wallet.custom_payload(payload, nonce, fee);
            let hash = client.send_transaction(&tx).await?;
            info!("Validator registration submitted: {}", hash);
        }
        Commands::Delegate {
            key_file,
            rpc_url,
            validator,
            amount,
            fee,
        } => {
            info!("Delegating to {} via {}", validator, rpc_url);
            let wallet = wallet_from_key_file(&key_file)?;
            let client = HttpClient::new(&rpc_url);
            let nonce = client.nonce(&wallet.address()).await?;
            let validator = Address::from_str(&validator)
                .map_err(|e| anyhow::anyhow!("invalid validator address: {validator}: {e}"))?;
            let payload =
                encode_staking_op(pemrix_vm::StakingOperation::Delegate { validator, amount });
            let tx = wallet.custom_payload(payload, nonce, fee);
            let hash = client.send_transaction(&tx).await?;
            info!("Delegation submitted: {}", hash);
        }
        Commands::Undelegate {
            key_file,
            rpc_url,
            validator,
            amount,
            fee,
        } => {
            info!("Undelegating from {} via {}", validator, rpc_url);
            let wallet = wallet_from_key_file(&key_file)?;
            let client = HttpClient::new(&rpc_url);
            let nonce = client.nonce(&wallet.address()).await?;
            let validator = Address::from_str(&validator)
                .map_err(|e| anyhow::anyhow!("invalid validator address: {validator}: {e}"))?;
            let payload =
                encode_staking_op(pemrix_vm::StakingOperation::Undelegate { validator, amount });
            let tx = wallet.custom_payload(payload, nonce, fee);
            let hash = client.send_transaction(&tx).await?;
            info!("Undelegation submitted: {}", hash);
        }
    }

    Ok(())
}

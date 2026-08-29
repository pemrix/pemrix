#[cfg(feature = "grpc")]
fn main() {
    std::env::set_var("PROTOC", protobuf_src::protoc());
    tonic_build::configure()
        .build_server(true)
        .compile_protos(&["proto/pemrix_rpc_v1.proto"], &["proto"])
        .expect("failed to compile PEMRIX RPC protobuf definitions");
}

#[cfg(not(feature = "grpc"))]
fn main() {}

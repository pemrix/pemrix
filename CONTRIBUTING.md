# Contributing to PEMRIX

Thank you for your interest in PEMRIX. This document explains how to contribute code, report issues, and follow the project's standards.

## Getting Started

1. Clone the repository.
2. Install Rust 1.75 or later.
3. Build the project:
   ```bash
   cargo build --release
   ```
4. Run tests:
   ```bash
   cargo test --workspace --all-features
   ```

## Development Workflow

1. Create a branch from `main` for your work.
2. Make your changes.
3. Run formatting, clippy, and tests:
   ```bash
   cargo fmt --check
   cargo clippy --all-targets --all-features -- -D warnings
   cargo test --workspace --all-features
   ```
4. Update relevant documentation in `docs/`.
5. Commit with a clear message describing what changed and why.
6. Open a pull request.

## Coding Standards

- Run `cargo fmt` before committing.
- Fix all `cargo clippy` warnings.
- Add tests for new functionality.
- Keep the consensus core small and deterministic.
- Do not introduce new dependencies without justification.
- Document public APIs with rustdoc comments.

## Security

If you discover a security issue, please follow the instructions in `SECURITY.md`. Do not open a public issue for security vulnerabilities.

## Questions

For questions, open a discussion or contact the maintainers at `hello@quanvio.com`.

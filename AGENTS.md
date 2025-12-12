# Agent Instructions

## Commands
- **Build Program:** `cargo build-sbf` (Target Solana SBF)
- **Test Program:** `cargo test` | Single: `cargo test -- test_name`
- **Lint Program:** `cargo clippy && cargo fmt -- --check`
- **Client Setup:** `cd client && pnpm install`
- **Run Client Script:** `cd client && npx tsx scripts/script_name.ts`

## Code Style & Conventions
- **Rust (Solana Program):**
  - **SDK:** STRICTLY use `pinocchio` (v0.9+). Do NOT use Anchor.
  - **Serialization:** Use `bytemuck` (`Pod`, `Zeroable`) for Zero-Copy.
  - **Structure:** `entrypoint!` in `lib.rs`. Modules in `instructions/`.
  - **State:** `#[repr(C)]` structs. Manually check discriminators/ownership.
  - **Errors:** Return `ProgramResult`; use `ProgramError`.
- **TypeScript (Client):**
  - **SDK:** Use `@solana/kit` (modern web3.js). Avoid legacy.
  - **Execution:** Use `tsx` for running scripts.
  - **Formatting:** Standard Prettier; explicit types.

## Environment
- Use `pnpm` for Node.js.
- Program logic is raw Solana/SBF, optimized for compute units.

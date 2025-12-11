use crate::state::NoteState;
use crate::utils::next_account_info;
use bytemuck::{Pod, Zeroable};
use pinocchio::{
    ProgramResult, account_info::AccountInfo, msg, program_error::ProgramError, pubkey::Pubkey,
};

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    // 1. Account Iterator
    // In raw Solana, accounts come in a specific order. You must document this!
    // [0] Note Account (must be writable, signer checks depend on your logic, usually signed by system program on creation)
    // [1] User/Payer (must be signer)
    let account_info_iter = &mut accounts.iter();
    let note_account = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;

    // 2. Security Checks (The Anchor "Constraints")

    // Check 1: Is the user a signer?
    if !user_account.is_signer() {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Check 2: Is the note account owned by THIS program?
    // If we are initializing, the account should have been created by the client
    // and assigned to this program ID immediately before this instruction.
    if note_account.owner() != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // 3. Zero-Copy Instruction Data
    // We cast the raw slice `data` into our struct `InitializeArgs`.
    // If the length doesn't match `sizeof(InitializeArgs)`, this fails safely.
    let args = bytemuck::try_from_bytes::<InitializeArgs>(data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    // 4. Zero-Copy Account Data (The Magic)
    // We get a mutable reference to the account's internal byte array.
    // Note: Pinocchio handles the RefCell for us usually, but we need to match the API.
    // Standard approach:

    // Safety check: Does the account have enough space?
    // NoteState size = 8 (u64) + 32 (pubkey) + 8 (u64) + 128 (content) = 176 bytes
    if note_account.data_len() < std::mem::size_of::<NoteState>() {
        return Err(ProgramError::AccountDataTooSmall);
    }

    // We borrow the data mutably.
    // In Pinocchio/Solana, this is an unsafe-like operation wrapped in a RefCell.
    let mut account_data = note_account.try_borrow_mut_data()?;

    // We cast the raw bytes of the account into our `NoteState` struct.
    let state = bytemuck::try_from_bytes_mut::<NoteState>(&mut account_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    // 5. Write logic
    state.discriminator = 0xBADF00D; // Just a magic number to verify type later
    state.author = *user_account.key(); // Copy the pubkey bytes
    state.id = args.id;
    state.content = args.content; // Copy the array (fast memcpy)

    msg!(&format!("Note Initialized: ID {}", args.id));

    Ok(())
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct InitializeArgs {
    pub id: u64,
    pub content: [u8; 128],
}

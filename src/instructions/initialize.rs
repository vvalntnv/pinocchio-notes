use crate::state::NoteState;
use crate::utils::next_account_info;
use bytemuck::{Pod, Zeroable};
use pinocchio::{
    ProgramResult, account_info::AccountInfo, log, program_error::ProgramError, pubkey::Pubkey,
};

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let note_account = next_account_info(account_info_iter)?;
    let user_account = next_account_info(account_info_iter)?;

    if !user_account.is_signer() {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if note_account.owner() != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // 3. Zero-Copy Instruction Data
    // We cast the raw slice `data` into our struct `InitializeArgs`.
    // If the length doesn't match `sizeof(InitializeArgs)`, this fails safely.
    let args = bytemuck::try_from_bytes::<InitializeArgs>(data).map_err(|error| {
        log::sol_log(&error.to_string());
        ProgramError::InvalidInstructionData
    })?;

    // Zero-Copy Account Data (The Magic)
    if note_account.data_len() < std::mem::size_of::<NoteState>() {
        return Err(ProgramError::AccountDataTooSmall);
    }

    let mut account_data = note_account.try_borrow_mut_data()?;

    let state = bytemuck::try_from_bytes_mut::<NoteState>(&mut account_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    state.discriminator = 0xBADF00D; // Just a magic number to verify type later
    state.author = *user_account.key(); // Copy the pubkey bytes
    state.id = args.id;
    state.content = args.content; // Copy the array (fast memcpy)

    Ok(())
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct InitializeArgs {
    pub discriminator: u64,
    pub id: u64,
    pub content: [u8; 128],
}

use bytemuck::{Pod, Zeroable};
use pinocchio::{
    ProgramResult, account_info::AccountInfo, program_error::ProgramError, pubkey::Pubkey,
};

use crate::{state::NoteState, utils::next_account_info};

pub fn process_update(
    program_id: &Pubkey,
    account_data: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut account_data.iter();
    let note_account = next_account_info(accounts_iter)?;
    let user_account = next_account_info(accounts_iter)?;

    if note_account.owner() != program_id {
        return Err(ProgramError::InvalidAccountOwner);
    }
    if !note_account.is_writable() {
        return Err(ProgramError::AccountBorrowFailed);
    }

    if note_account.data_len() < size_of::<NoteState>() {
        return Err(ProgramError::AccountDataTooSmall);
    }

    let mut notes_account_data_ref = note_account
        .try_borrow_mut_data()
        .map_err(|_| ProgramError::InvalidAccountData)?;

    let notes_account_data = bytemuck::try_from_bytes_mut::<NoteState>(&mut notes_account_data_ref)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    let author_pubkey = Pubkey::from(notes_account_data.author);
    if user_account.key().as_ref() != author_pubkey {
        return Err(ProgramError::IllegalOwner);
    }

    let instruction_data = bytemuck::try_from_bytes::<UpdateArgs>(instruction_data)
        .map_err(|_| ProgramError::InvalidAccountData)?;

    notes_account_data.content = instruction_data.content;

    Ok(())
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct UpdateArgs {
    pub discriminator: u8,
    pub content: [u8; 128],
}

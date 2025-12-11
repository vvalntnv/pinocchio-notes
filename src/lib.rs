mod instructions;
mod state;
mod utils;

use pinocchio::{
    ProgramResult, account_info::AccountInfo, entrypoint, msg, program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    msg!("Hello from my program!");

    let (discriminator, _) = instruction_data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match discriminator {
        0 => msg!("Initializing theze nuts"),
        1 => msg!("Updating them nutz"),
        _ => return Err(ProgramError::InvalidInstructionData),
    };

    Ok(())
}

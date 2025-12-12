mod helpers;
mod instructions;
mod state;
mod utils;

use pinocchio::{
    ProgramResult, account_info::AccountInfo, entrypoint, program_error::ProgramError,
    pubkey::Pubkey,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let discriminator = instruction_data
        .get(0)
        .ok_or(ProgramError::InvalidInstructionData)?;

    match discriminator {
        0 => instructions::initialize::process_initialize(program_id, accounts, instruction_data),
        1 => instructions::update::process_update(program_id, accounts, instruction_data),
        _ => return Err(ProgramError::InvalidInstructionData),
    }
}

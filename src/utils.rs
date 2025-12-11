use pinocchio::{account_info::AccountInfo, program_error::ProgramError};

// Helper to iterate accounts (Pinocchio doesn't always include this by default like solana_program)
pub fn next_account_info<'a, I>(iter: &mut I) -> Result<&'a AccountInfo, ProgramError>
where
    I: Iterator<Item = &'a AccountInfo>,
{
    iter.next().ok_or(ProgramError::NotEnoughAccountKeys)
}

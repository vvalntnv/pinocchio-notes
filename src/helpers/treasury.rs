use pinocchio::{
    account_info::AccountInfo,
    cpi::invoke,
    instruction::{AccountMeta, Instruction},
    program_error::ProgramError,
};

pub fn transfer_to_treasury(transfer_info: TransferInformation) -> Result<(), ProgramError> {
    let system_program = transfer_info.system_program;
    let treasury_account = transfer_info.treasury_account;
    let user_account = transfer_info.user_account;

    let mut transfer_data = [0u8; 12]; // 12 bytes (instruction data) to invoke the system transfer program

    transfer_data[0..4].copy_from_slice(&2u32.to_le_bytes()); // the instruction number
    transfer_data[4..12].copy_from_slice(&1000u64.to_le_bytes()); // the ammount to transfer

    let transfer_ix = Instruction {
        program_id: system_program.key(),
        accounts: &[
            AccountMeta {
                pubkey: user_account.key(),
                is_signer: true,
                is_writable: true,
            },
            AccountMeta {
                pubkey: treasury_account.key(),
                is_signer: false,
                is_writable: true,
            },
        ],
        data: &transfer_data,
    };

    invoke(
        &transfer_ix,
        &[user_account, treasury_account, system_program],
    )?;

    Ok(())
}

pub struct TransferInformation<'a> {
    pub user_account: &'a AccountInfo,
    pub system_program: &'a AccountInfo,
    pub treasury_account: &'a AccountInfo,
}

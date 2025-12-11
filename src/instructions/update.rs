use bytemuck::{Pod, Zeroable};
use pinocchio::ProgramResult;

pub fn update(instruction_data: &[u8]) -> ProgramResult {
    Ok(())
}

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct UpdateArgs {
    pub content: [u8; 128],
}

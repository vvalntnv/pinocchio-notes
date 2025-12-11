use bytemuck::{Pod, Zeroable};

#[repr(C)]
#[derive(Clone, Copy, Pod, Zeroable)]
pub struct NoteState {
    pub discriminator: u64,
    pub author: [u8; 32],
    pub id: u64,
    pub content: [u8; 128],
}

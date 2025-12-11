import { Address } from "@solana/kit";

export interface NoteState {
  discriminator: bigint,
  author: Address,
  id: bigint,
  content: string
}

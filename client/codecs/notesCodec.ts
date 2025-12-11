import {
  fixCodecSize,
  getAddressCodec,
  getStructCodec,
  getU64Codec,
  getU8Codec,
  getUtf8Codec,
  type Codec,
} from "@solana/kit";
import { type NoteState } from "@/types/noteData";

export const codec: Codec<NoteState> = getStructCodec([
  ["discriminator", getU64Codec()],
  ["author", getAddressCodec()],
  ["id", getU64Codec()],
  ["content", fixCodecSize(getUtf8Codec(), 128)],
]);

import { UpdateNote } from "@/types/update";
import {
  Codec,
  fixCodecSize,
  getStructCodec,
  getU8Codec,
  getUtf8Codec,
} from "@solana/kit";
import { checkContentLength, wrapEncoderWithCheck } from "./utils";

const _codec: Codec<UpdateNote> = getStructCodec([
  ["discriminator", getU8Codec()],
  ["content", fixCodecSize(getUtf8Codec(), 128)],
]);

export const codec = wrapEncoderWithCheck(_codec, checkContentLength);

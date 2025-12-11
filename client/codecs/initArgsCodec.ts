import { InitializeAccountArgs } from "@/types/initialize";
import {
  Codec,
  fixCodecSize,
  getStructCodec,
  getU64Codec,
  getU8Codec,
  getUtf8Codec,
} from "@solana/kit";

const _codec: Codec<InitializeAccountArgs> = getStructCodec([
  ["discriminator", fixCodecSize(getU8Codec(), 8)],
  ["noteId", getU64Codec()],
  ["content", fixCodecSize(getUtf8Codec(), 128)],
]);

const encoderWrapper = (data: InitializeAccountArgs) => {
  if (data === null || typeof data !== "object") {
    throw new Error("wyd atp?");
  }
  const isContentInData = "content" in data;
  if (!isContentInData) {
    throw new Error("wrong data passed bro. no content");
  }
  if (typeof data.content !== "string") {
    throw new Error("content should be string bro");
  }

  // we assume ASCII
  if (data.content.length > 128) {
    throw new Error("content too long (never had that problem)");
  }

  return _codec.encode(data as InitializeAccountArgs);
};

export const codec = {
  encode: encoderWrapper,
  decode: _codec.decode,
};

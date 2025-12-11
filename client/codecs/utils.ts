import { Codec } from "@solana/kit";

export const checkContentLength = <T>(data: T) => {
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
};

export const wrapEncoderWithCheck = <T>(
  codec: Codec<T>,
  checkFunc: (data: T) => void,
): Codec<T> => {
  return {
    ...codec,
    encode: (value: T) => {
      checkFunc(value);
      return codec.encode(value);
    },
  };
};

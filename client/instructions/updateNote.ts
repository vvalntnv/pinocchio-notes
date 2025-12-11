import { createClient } from "@/client";
import { codec } from "@/codecs/updateNotesCodec";
import { PROGRAM_ADDRESS } from "@/constants";
import { UpdateNote } from "@/types/update";
import {
  AccountRole,
  Address,
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  type Instruction,
} from "@solana/kit";

export async function updateNote(noteAddress: Address, updateData: UpdateNote) {
  const client = await createClient();
  const dataEncoded = codec.encode(updateData);

  const instructionData: Instruction = {
    programAddress: PROGRAM_ADDRESS,
    accounts: [
      {
        address: noteAddress,
        role: AccountRole.WRITABLE,
      },
      {
        address: client.wallet.address,
        role: AccountRole.READONLY_SIGNER,
      },
    ],
    data: dataEncoded,
  };

  const { value: recentBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(instructionData, tx),
  );

  const tx = await signTransactionMessageWithSigners(txMessage);
  assertIsSendableTransaction(tx);
  assertIsTransactionWithBlockhashLifetime(tx);

  await client.sendAndConfirmTransaction(tx, { commitment: "confirmed" });

  const sig = getSignatureFromTransaction(tx);

  return sig;
}

import { createClient } from "@/client";
import { codec } from "@/codecs/initArgsCodec";
import { INITIALIZE_INSTRUCTION, PROGRAM_ADDRESS } from "@/constants";
import { InitializeAccountArgs } from "@/types/initialize";
import {
  Address,
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  getSignatureFromTransaction,
  type Instruction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  AccountRole,
} from "@solana/kit";

export async function initializeAccount(
  args: InitializeAccountArgs,
  noteAddress: Address,
) {
  const client = await createClient();
  const encodedData = codec.encode(args);

  console.log("LENGTH: ", encodedData.length);
  const instruction: Instruction = {
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
    data: encodedData,
  };

  const { value: latestBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const transactionMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(instruction, tx),
  );

  const transaction =
    await signTransactionMessageWithSigners(transactionMessage);

  assertIsSendableTransaction(transaction);
  assertIsTransactionWithBlockhashLifetime(transaction);

  await client.sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
  });

  return getSignatureFromTransaction(transaction);
}

import { createClient } from "./client";
import {
  address,
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

checkProgram();

async function checkProgram() {
  const client = await createClient();
  const programAddress = address("moq19rQqv4wykNzPG4k45ofyoxuHTfPqqCqPFGJQaUz");
  const instruction: Instruction = {
    programAddress,
    accounts: [],
    data: new Uint8Array([1]),
  };
  console.log("Wallet Address:", client.wallet.address);
  console.log("Address Length:", client.wallet.address?.length);

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

  const sig = getSignatureFromTransaction(transaction);
  const txData = await client.rpc.getTransaction(sig).send();

  if (txData === null) {
    throw new Error("Transaction Cannot be null bro");
  }

  const logs = txData.meta?.logMessages;
  console.log("Transction Signature: ", sig);
  console.log("Logs obtained", logs);
}

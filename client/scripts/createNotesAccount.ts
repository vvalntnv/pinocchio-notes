import { createClient } from "@/client";
import { PROGRAM_ADDRESS } from "@/constants";
import { getCreateAccountInstruction } from "@solana-program/system";
import {
  address,
  Address,
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  generateKeyPair,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";

export const NOTE_SIZE =
  8 + // Discriminator
  32 + // Author
  8 + // the id
  128; // Note Content

/// Initializes a note with empty data
async function createNotesAccount(): Promise<Address> {
  const client = await createClient();
  const newAccount = await generateKeyPairSigner();
  const exemptLamports = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(NOTE_SIZE))
    .send();

  const ix = getCreateAccountInstruction({
    payer: client.wallet,
    newAccount,
    lamports: exemptLamports,
    programAddress: PROGRAM_ADDRESS,
    space: NOTE_SIZE,
  });

  console.log("passed the ix");

  const { value: recentBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(client.wallet, tx),
    (tx) => setTransactionMessageLifetimeUsingBlockhash(recentBlockhash, tx),
    (tx) => appendTransactionMessageInstruction(ix, tx),
  );

  const transaction = await signTransactionMessageWithSigners(txMessage);
  assertIsSendableTransaction(transaction);
  assertIsTransactionWithBlockhashLifetime(transaction);

  await client.sendAndConfirmTransaction(transaction, {
    commitment: "confirmed",
  });

  const txSig = getSignatureFromTransaction(transaction);
  console.log("sig", txSig);

  const account = await client.rpc.getAccountInfo(newAccount.address).send();
  console.log("data:", account.value?.data);

  return newAccount.address;
}

export default createNotesAccount;

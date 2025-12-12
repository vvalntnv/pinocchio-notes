import {
  Address,
  appendTransactionMessageInstruction,
  assertIsSendableTransaction,
  assertIsTransactionWithBlockhashLifetime,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  KeyPairSigner,
  pipe,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import { getCreateAccountInstruction } from "@solana-program/system";
import { Client } from "./client";

export type CreateAccountParams = {
  client: Client;
  space: number | bigint;
  programAddress: Address;
  payer?: KeyPairSigner;
  newAccount?: KeyPairSigner;
};

/**
 * General purpose function to create a new account with specific space and owner program
 */
export async function createAccount({
  client,
  space,
  programAddress,
  payer,
  newAccount,
}: CreateAccountParams): Promise<KeyPairSigner> {
  const accountSigner = newAccount ?? (await generateKeyPairSigner());
  const feePayer = payer ?? client.wallet;

  const exemptLamports = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(space))
    .send();

  const ix = getCreateAccountInstruction({
    payer: feePayer,
    newAccount: accountSigner,
    lamports: exemptLamports,
    programAddress: programAddress,
    space: space,
  });

  const { value: recentBlockhash } = await client.rpc
    .getLatestBlockhash()
    .send();

  const txMessage = pipe(
    createTransactionMessage({ version: 0 }),
    (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
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
  // Optional: Log or let the caller handle logging
  // console.log("Account created. Sig:", txSig);

  return accountSigner;
}

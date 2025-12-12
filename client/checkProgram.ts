import { createClient } from "./client";
import createNotesAccount from "./scripts/createNotesAccount";
import { initializeAccount } from "./instructions/initializeNote";
import { codec } from "./codecs/notesCodec";
import { assertAccountExists, fetchEncodedAccount } from "@solana/kit";
import { updateNote } from "./instructions/updateNote";
import { createTreasuryAccount } from "./scripts/createTreasuryAccount";

checkProgram();

async function checkProgram() {
  const client = await createClient();

  const notesAccountAddress = await createNotesAccount();
  const treasuryAccountAddress = await createTreasuryAccount();

  // Improvement: Disciminator is unnecessary here
  // we know initialize => 0
  // Handle the discriminator in the instruction function
  const transactionSig = await initializeAccount(
    {
      discriminator: 0,
      noteId: BigInt(1),
      content: "somecontent",
    },
    notesAccountAddress,
  );

  const txData = await client.rpc.getTransaction(transactionSig).send();

  if (txData === null) {
    throw new Error("Transaction Cannot be null bro");
  }

  const accountData = await fetchEncodedAccount(
    client.rpc,
    notesAccountAddress,
  );
  assertAccountExists(accountData);

  await updateNote(notesAccountAddress, treasuryAccountAddress, {
    discriminator: 1,
    content: "this is the new text",
  });

  const updatedAccountData = await fetchEncodedAccount(
    client.rpc,
    notesAccountAddress,
  );
  assertAccountExists(updatedAccountData);

  const treasuryAccountData = await fetchEncodedAccount(
    client.rpc,
    treasuryAccountAddress,
  );
  assertAccountExists(treasuryAccountData);

  const exemptLamports = await client.rpc
    .getMinimumBalanceForRentExemption(BigInt(0))
    .send();

  const updatedNoteData = codec.decode(updatedAccountData.data);
  console.log("Author", updatedNoteData.author.toString());
  console.log("updatedData", updatedNoteData);
  console.log(
    "Treasury Account Balance",
    treasuryAccountData.lamports - exemptLamports,
  );
}

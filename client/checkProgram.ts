import { createClient } from "./client";
import createNotesAccount from "./scripts/createNotesAccount";
import { initializeAccount } from "./instructions/initializeNote";
import { codec } from "./codecs/notesCodec";
import { assertAccountExists, fetchEncodedAccount } from "@solana/kit";
import { updateNote } from "./instructions/updateNote";

checkProgram();

async function checkProgram() {
  const client = await createClient();

  const notesAccountAddress = await createNotesAccount();

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

  const logs = txData.meta?.logMessages;
  console.log("Transction Signature: ", transactionSig);
  console.log("Logs obtained", logs);

  const accountData = await fetchEncodedAccount(
    client.rpc,
    notesAccountAddress,
  );
  assertAccountExists(accountData);

  const noteData = codec.decode(accountData.data);
  console.log("Author", noteData.author.toString());
  console.log("the data", noteData);

  const updateTxSig = await updateNote(notesAccountAddress, {
    discriminator: 1,
    content: "this is the new text",
  });

  console.log("Transction Signature: ", updateTxSig);

  const updatedAccountData = await fetchEncodedAccount(
    client.rpc,
    notesAccountAddress,
  );
  assertAccountExists(updatedAccountData);

  const updatedNoteData = codec.decode(updatedAccountData.data);
  console.log("Author", updatedNoteData.author.toString());
  console.log("updatedData", updatedNoteData);
}

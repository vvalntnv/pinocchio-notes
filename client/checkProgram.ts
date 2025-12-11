import { createClient } from "./client";
import createNotesAccount from "./scripts/createNotesAccount";
import { initializeAccount } from "./instructions/initializeNote";
import { codec } from "./codecs/notesCodec";
import { assertAccountExists, fetchEncodedAccount } from "@solana/kit";

checkProgram();

async function checkProgram() {
  const client = await createClient();

  const notesAccountAddress = await createNotesAccount();

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
}

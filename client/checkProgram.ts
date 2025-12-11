import { createClient } from "./client";
import createNotesAccount from "./scripts/createNotesAccount";
import { INITIALIZE_INSTRUCTION } from "./constants";
import { initializeAccount } from "./instructions/initializeNote";

checkProgram();

async function checkProgram() {
  const client = await createClient();

  const notesAccountAddress = await createNotesAccount();
  console.log("The address of the note", notesAccountAddress.toString());

  const accountInfo = await client.rpc
    .getAccountInfo(notesAccountAddress)
    .send();

  console.log("owner: ", accountInfo.value?.owner.toString());

  const transactionSig = await initializeAccount(
    {
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
}

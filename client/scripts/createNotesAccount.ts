import { createClient } from "@/client";
import { PROGRAM_ADDRESS } from "@/constants";
import { Address } from "@solana/kit";
import { createAccount } from "@/utils";

export const NOTE_SIZE =
  8 + // Discriminator
  32 + // Author
  8 + // the id
  128; // Note Content

/// Initializes a note with empty data
async function createNotesAccount(): Promise<Address> {
  const client = await createClient();

  const newAccount = await createAccount({
    client,
    space: NOTE_SIZE,
    programAddress: PROGRAM_ADDRESS,
  });

  const account = await client.rpc.getAccountInfo(newAccount.address).send();
  console.log("data:", account.value?.data);

  return newAccount.address;
}

export default createNotesAccount;

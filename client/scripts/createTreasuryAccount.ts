import { createClient } from "@/client";
import { PROGRAM_ADDRESS } from "@/constants";
import { createAccount } from "@/utils";
import { Address } from "@solana/kit";

export async function createTreasuryAccount(): Promise<Address> {
  const client = await createClient();

  const newAccount = await createAccount({
    client,
    space: 0,
    programAddress: PROGRAM_ADDRESS,
  });

  return newAccount.address;
}

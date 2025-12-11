import {
  createSignerFromKeyPair,
  KeyPairSigner,
  Rpc,
  RpcSubscriptions,
  sendAndConfirmTransactionFactory,
  SolanaRpcApi,
  SolanaRpcSubscriptionsApi,
} from "@solana/kit";
import {
  createKeyPairFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
} from "@solana/kit";
import fs from "fs";

export type Client = {
  rpc: Rpc<SolanaRpcApi>;
  rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  sendAndConfirmTransaction: ReturnType<
    typeof sendAndConfirmTransactionFactory
  >;
  wallet: KeyPairSigner;
};

let client: Client | undefined;
export async function createClient(): Promise<Client> {
  if (!client) {
    return await initializeClient();
  }

  return client;
}

async function initializeClient(): Promise<Client> {
  const keypairFile = fs.readFileSync(
    "/Users/viktorvalentinov/.config/solana/id.json",
  );
  const stringOola = keypairFile.toString();
  const oola = JSON.parse(stringOola);

  const keypairBytes = new Uint8Array(oola);
  const rpc = createSolanaRpc("http://127.0.0.1:8899");
  const rpcSubscriptions = createSolanaRpcSubscriptions("ws://127.0.0.1:8900");

  const keypair = await createKeyPairFromBytes(keypairBytes);
  const wallet = await createSignerFromKeyPair(keypair);
  const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
    rpc,
    rpcSubscriptions,
  });

  client = {
    rpc,
    sendAndConfirmTransaction,
    rpcSubscriptions,
    wallet,
  };

  return client;
}

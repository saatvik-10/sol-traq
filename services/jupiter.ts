import { JUPITER_API, JUPITER_PRICE_API } from '../utils/tokens';

export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50,
) {
  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps.toString(),
  });

  const res = await fetch(`${JUPITER_API}/quote?${params}`);

  if (!res.ok) {
    throw new Error(`Quotation failed!: ${res.statusText}`);
  }

  const quote = await res.json();

  return quote;
}

export async function getSwapTxn(quoteResponse: any, userPublicKey: string) {
  const res = await fetch(`${JUPITER_API}/swap`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quoteResponse,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  });

  if (!res.ok) {
    throw new Error(`Swap failed!: ${res.statusText}`);
  }

  const data = await res.json();

  return data.swapTransaction;
}

export async function getTokenPrice(mintAddress: string): Promise<number> {
  const res = await fetch(`${JUPITER_PRICE_API}/price?ids=${mintAddress}`);

  const data = await res.json();

  return data.data?.[mintAddress]?.price || 0;
}

export const JUPITER_API = 'https://quote-api.jup.ag/v6';

export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112', // Wrapped SOL
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
};

export const TOKEN_INFO: Record<
  string,
  { symbol: string; name: string; decimals: number }
> = {
  [TOKENS.SOL]: { symbol: 'SOL', name: 'Solana', decimals: 9 },
  [TOKENS.USDC]: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  [TOKENS.USDT]: { symbol: 'USDT', name: 'Tether', decimals: 6 },
  [TOKENS.BONK]: { symbol: 'BONK', name: 'Bonk', decimals: 5 },
  [TOKENS.JUP]: { symbol: 'JUP', name: 'Jupiter', decimals: 6 },
  [TOKENS.WIF]: { symbol: 'WIF', name: 'dogwifhat', decimals: 6 },
};

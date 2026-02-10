import { rpc } from '../handler/rpc';

export const getTokens = async (addr: string) => {
  const res = await rpc('getTokenAccountByOwner', [
    addr,
    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
    { encoding: 'jsonParsed' },
  ]);

  return (res.value || [])
    .map((acc: any) => ({
      mint: acc.account.data.parsed.info.mint,
      amount: acc.account.data.parsed.info.tokenAmount.uiAmount,
    }))
    .filter((acc: any) => acc.amount > 0);
};

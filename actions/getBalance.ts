import { rpc } from '../handler/rpc';

export const getBalance = async (addr: string) => {
  const res = await rpc('getBalance', [addr]);
  return res.value / 1000_000_000;
};

import { rpc } from '../handler/rpc';

export const getTxns = async (addr: string) => {
  const sigs = await rpc('getSignaturesForAddress', [addr, { limit: 10 }]);
  return sigs.map((sig: any) => ({
    sig: sig.signature,
    time: sig.blocktime,
    ok: !sig.err,
  }));
};

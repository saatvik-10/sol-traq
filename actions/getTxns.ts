import { rpc } from '../handler/rpc';

export const getTxns = async (addr: string) => {
  const sigs = await rpc('getSignatureForAddress', [addr, { limit: 10 }]);
  return sigs.map((sig: any) => ({
    sig: sig.signature,
    time: sig.blockchain,
    ok: !sig.err,
  }));
};

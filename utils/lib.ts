export const short = (s: string, n = 4) => `${s.slice(0, n)}...${s.slice(-n)}`;

export const timeAgo = (ts: number) => {
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

export const shortenAddress = (addr: string) => {
  const address = `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  return address;
};

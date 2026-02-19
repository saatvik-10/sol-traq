import { useState, useCallback } from 'react';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js';
import { useWalletStore } from '../stores/wallet-store';

const APP_IDENTITY = {
  name: '$ol-Traq',
  uri: '',
  icon: '',
};

export function useWallet() {
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const cluster = isDevnet ? 'devnet' : 'mainnet-beta';
  const connection = new Connection(clusterApiUrl(cluster), 'confirmed');

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const authResult = await transact(async (wallet: Web3MobileWallet) => {
        const res = await wallet.authorize({
          chain: `solana: ${cluster}`,
          identity: APP_IDENTITY,
        });
        return res;
      });

      const pubkey = new PublicKey(
        Buffer.from(authResult.accounts[0].address, 'base64'),
      );
      setPublicKey(pubkey);
      return pubkey;
    } catch (err) {
      console.log('Wallet connection failed', err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [cluster]);

  const disconnect = useCallback(() => {
    setPublicKey(null);
  }, []);

  const getBalance = useCallback(async () => {
    if (!publicKey) {
      throw new Error('No wallet found');
    }

    const balance = await connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }, []);

  const sendSOL = useCallback(
    async (toAddr: string, amount: number) => {
      if (!publicKey) throw new Error('Wallet not connected');

      setIsSending(true);
      try {
        const toPubKey = new PublicKey(toAddr);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: toPubKey,
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          }),
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const txnSig = await transact(async (wallet: Web3MobileWallet) => {
          await wallet.authorize({
            chain: `solana: ${cluster}`,
            identity: APP_IDENTITY,
          });

          const sigs = await wallet.signAndSendTransactions({
            transactions: [transaction],
          });

          return sigs[0];
        });
        return txnSig;
      } catch (err) {
        console.log('Err sending txn', err);
      } finally {
        setIsSending(false);
      }
    },
    [publicKey, connection, cluster],
  );

  return {
    publicKey,
    isConnected: !!publicKey,
    isConnecting,
    isSending,
    connect,
    disconnect,
    getBalance,
    sendSOL,
    connection,
  };
}

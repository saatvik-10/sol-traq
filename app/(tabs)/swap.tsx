import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../../styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TOKENS,
  TOKEN_INFO,
} from '../../utils/tokens';
import {
  getSwapQuote,
  getSwapTxn,
  getTokenPrice,
} from '../../services/jupiter';
import { useWallet } from '../../hooks/useWallet';
import {
  transact,
  Web3MobileWallet,
} from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { VersionedTransaction } from '@solana/web3.js';
import { fromSmallestUnit, toSmallestUnits } from '../../utils/lib';

export default function SwapScreen() {
  const wallet = useWallet();

  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(TOKENS.SOL);
  const [toToken, setToToken] = useState(TOKENS.USDC);

  const [quoteData, setQuoteData] = useState<any>(null);
  const [swapping, setSwapping] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const inputInfo = TOKEN_INFO[fromToken];
  const outputInfo = TOKEN_INFO[toToken];

  const fetchQuote = useCallback(async () => {
    if (!fromAmount || Number(fromAmount) <= 0) {
      setToAmount('');
      setQuoteData(null);
      return;
    }

    setLoading(true);

    try {
      const amountInSmallest = toSmallestUnits(
        Number(fromAmount),
        inputInfo.decimals,
      );

      const quote = await getSwapQuote(fromToken, toToken, amountInSmallest);

      (setQuoteData(quote),
        setToAmount(
          fromSmallestUnit(quote.toAmount, outputInfo.decimals).toFixed(
            outputInfo.decimals > 6 ? 4 : 2,
          ),
        ),
        setPriceImpact(quote.priceImpact));
    } catch (err: any) {
      console.log('Quotation Err!', err);
      setToAmount('Err');
      setQuoteData(null);
    } finally {
      setLoading(false);
    }
  }, [fromAmount, fromToken, toToken]);

  useEffect(() => {
    const timer = setTimeout(fetchQuote, 500);
    return () => clearTimeout(timer);
  }, [fetchQuote]);

  const swapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount('');
    setQuoteData(null);
  };

  const handleSwap = async () => {
    if (!wallet.isConnected || !wallet.publicKey) {
      return Alert.alert('Please connect your wallet to continue!');
    }

    if (!quoteData) return Alert.alert('Quotation is missing!');

    setSwapping(true);

    try {
      const swapTxn = await getSwapTxn(quoteData, wallet.publicKey.toBase58());

      const swapTxnBuffer = Buffer.from(swapTxn, 'base64');
      const txn = VersionedTransaction.deserialize(swapTxnBuffer);

      const sig = await transact(async (mobileWallet: Web3MobileWallet) => {
        await mobileWallet.authorize({
          chain: 'solana:mainnet-beta',
          identity: {
            name: '$ol-Traq',
            uri: 'https://solscan.io',
            icon: '',
          },
        });

        const sigs = await mobileWallet.signAndSendTransactions({
          transactions: [txn],
        });

        return sigs[0];
      });

      Alert.alert(
        'Swap Successful!',
        `Swapped ${fromAmount} ${inputInfo.symbol} → ${toAmount} ${outputInfo.symbol}`,
      );

      setFromAmount('');
      setToAmount('');
      setQuoteData(null);
    } catch (error: any) {
      Alert.alert('Swap Failed', error.message);
    } finally {
      setSwapping(false);
    }
  };

  return (
    <View style={s.container}>
      <Text style={s.title}>🔄 Swap</Text>

      <View style={s.tokenCard}>
        <Text style={s.tokenLabel}>You Pay</Text>
        <View style={s.tokenRow}>
          <TextInput
            style={s.amountInput}
            placeholder='0.0'
            placeholderTextColor='#555'
            value={fromAmount}
            onChangeText={setFromAmount}
            keyboardType='decimal-pad'
          />
          <View style={s.tokenBadge}>
            <Text style={s.tokenSymbol}>{inputInfo.symbol}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={s.flipButton} onPress={swapTokens}>
        <Ionicons name='swap-vertical' size={24} color='#14F195' />
      </TouchableOpacity>

      <View style={s.tokenCard}>
        <Text style={s.tokenLabel}>You Receive</Text>
        <View style={s.tokenRow}>
          <View style={s.outputAmount}>
            {loading ? (
              <ActivityIndicator color='#14F195' />
            ) : (
              <Text style={s.outputText}>{toAmount || '0.0'}</Text>
            )}
          </View>
          <View style={s.tokenBadge}>
            <Text style={s.tokenSymbol}>{outputInfo.symbol}</Text>
          </View>
        </View>
      </View>

      {quoteData && (
        <View style={s.details}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Rate</Text>
            <Text style={s.detailValue}>
              1 {inputInfo.symbol} ≈{' '}
              {(Number(toAmount) / Number(fromAmount)).toFixed(4)}{' '}
              {outputInfo.symbol}
            </Text>
          </View>
          {priceImpact && (
            <View style={s.detailRow}>
              <Text style={s.detailLabel}>Price Impact</Text>
              <Text
                style={[
                  s.detailValue,
                  Number(priceImpact) > 1 && { color: '#FF4545' },
                ]}
              >
                {Number(priceImpact).toFixed(2)}%
              </Text>
            </View>
          )}
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Slippage</Text>
            <Text style={s.detailValue}>0.5%</Text>
          </View>
        </View>
      )}

      {wallet.isConnected ? (
        <TouchableOpacity
          style={[
            s.swapButton,
            (!quoteData || swapping) && s.swapButtonDisabled,
          ]}
          onPress={handleSwap}
          disabled={!quoteData || swapping}
        >
          {swapping ? (
            <ActivityIndicator color='#0a0a1a' />
          ) : (
            <Text style={s.swapButtonText}>
              {quoteData ? 'Swap' : 'Enter an amount'}
            </Text>
          )}
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.connectButton} onPress={wallet.connect}>
          <Text style={s.connectButtonText}>Connect Wallet to Swap</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

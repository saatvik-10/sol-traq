import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../../styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  TOKENS,
  TOKEN_INFO,
  JUPITER_API,
  JUPITER_PRICE_API,
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
import { Transaction, VersionedTransaction } from '@solana/web3.js';
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
            name: 'Sol-Traq',
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
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <Text style={s.title}>Swap Tokens</Text>
        <View style={[s.card, { marginBottom: 10 }]}>
          <View style={s.cardHeader}>
            <TouchableOpacity style={s.tokenSelector}>
              <View style={[s.tokenIcon, { backgroundColor: '#9945FF' }]}>
                <Text style={s.tokenIconText}>S</Text>
              </View>
              <Text style={s.tokenName}>{fromToken}</Text>
              <Ionicons name='chevron-down' size={18} color='#888' />
            </TouchableOpacity>
            <TextInput
              style={s.amountInput}
              value={fromAmount}
              onChangeText={setFromAmount}
              keyboardType='numeric'
              placeholder='0'
              placeholderTextColor='#666'
            />
          </View>
          <View style={s.cardFooter}>
            <Text style={s.balanceText}>Balance: 0.0661 {fromToken}</Text>
          </View>
        </View>

        <View style={s.arrowContainer}>
          <TouchableOpacity style={s.swapArrow} onPress={swapTokens}>
            <Ionicons name='swap-vertical-outline' size={22} color='#000' />
          </TouchableOpacity>
        </View>

        <View style={[s.card, { marginBottom: 10 }]}>
          <View style={s.cardHeader}>
            <TouchableOpacity style={s.tokenSelector}>
              <View style={[s.tokenIcon, { backgroundColor: '#2775CA' }]}>
                <Text style={s.tokenIconText}>U</Text>
              </View>
              <Text style={s.tokenName}>{toToken}</Text>
              <Ionicons name='chevron-down' size={18} color='#888' />
            </TouchableOpacity>
            <TextInput
              style={s.amountInput}
              value={toAmount}
              onChangeText={setToAmount}
              keyboardType='numeric'
              placeholder='0'
              placeholderTextColor='#666'
            />
          </View>
          <View style={s.cardFooter}>
            <Text style={s.usdText}>$499.749</Text>
          </View>
        </View>

        <TouchableOpacity style={s.swapBtn} onPress={handleSwap}>
          <Text style={s.swapBtnText}>Swap</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

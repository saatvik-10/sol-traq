import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWallet } from '../hooks/useWallet';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';

export default function SendScreen() {
  const route = useRouter();
  const wallet = useWallet();

  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [txnSig, setTxnSig] = useState<string | null>(null);

  const handleSolSend = async () => {
    if (!toAddress.trim())
      return Alert.alert('Please enter a recipient address');

    if (!amount.trim || isNaN(Number(amount)) || Number(amount) <= 0)
      return Alert.alert('Please enter a valid amount');

    try {
      const sig = await wallet.sendSOL(toAddress.trim(), Number(amount));
      if (sig) {
        setTxnSig(sig);
      }
      Alert.alert(
        'Transaction Sent',
        `Sent ${amount} Sol\nSignature: ${sig?.slice(0, 20)}...`,
        [
          {
            text: 'View on SolScan',
            onPress: () => Linking.openURL(`https://solscan.io/tx/${sig}`),
          },
          {
            text: 'Done',
            onPress: () => {
              route.back();
            },
          },
        ],
      );
    } catch (err: any) {
      Alert.alert('Transaction Failed', err.message || 'Something went wrong');
    }
  };

  if (!wallet.isConnected) {
    return (
      <View style={s.center}>
        <Ionicons name='wallet-outline' size={64} color='#333' />
        <Text style={s.emptyTitle}>Wallet Not Connected</Text>
        <Text style={s.emptyText}>
          Connect your wallet from the Explorer tab first.
        </Text>
        <TouchableOpacity style={s.backButton} onPress={() => route.back()}>
          <Text style={s.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={s.header}>
        <TouchableOpacity onPress={() => route.back()}>
          <Ionicons name='arrow-back' size={24} color='#fff' />
        </TouchableOpacity>
        <Text style={s.title}>Send SOL</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>From</Text>
        <Text style={s.cardAddress}>
          {wallet.publicKey?.toBase58().slice(0, 8)}...
          {wallet.publicKey?.toBase58().slice(-4)}
        </Text>
      </View>

      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>Recipient Address</Text>
        <TextInput
          style={s.input}
          placeholder='Paste Solana address...'
          placeholderTextColor='#555'
          value={toAddress}
          onChangeText={setToAddress}
          autoCapitalize='none'
          autoCorrect={false}
        />
      </View>

      <View style={s.inputGroup}>
        <Text style={s.inputLabel}>Amount (SOL)</Text>
        <TextInput
          style={s.input}
          placeholder='0.0'
          placeholderTextColor='#555'
          value={amount}
          onChangeText={setAmount}
          keyboardType='decimal-pad'
        />
      </View>

      <TouchableOpacity
        style={[s.sendButton, wallet.isSending && s.sendButtonDisabled]}
        onPress={handleSolSend}
        disabled={wallet.isSending}
      >
        {wallet.isSending ? (
          <ActivityIndicator color='#0a0a1a' />
        ) : (
          <Text style={s.sendButtonText}>Send SOL</Text>
        )}
      </TouchableOpacity>

      <Text style={s.feeText}>Network fee: ~0.000005 SOL ($0.001)</Text>
    </KeyboardAvoidingView>
  );
}

import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { getBalance } from './actions/getBalance';
import { getTokens } from './actions/getTokens';
import { getTxns } from './actions/getTxns';

export default function App() {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [tokens, setTokens] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);

  const search = async () => {
    const addr = address.trim();

    if (!addr) return Alert.alert('Enter a wallet address to proceed!');

    setLoading(true);

    try {
      const [bal, tk, txn] = await Promise.all([
        getBalance(addr),
        getTokens(addr),
        getTxns(addr),
      ]);

      setBalance(bal);
      setTokens(tk);
      setTxns(txn);
    } catch (err: any) {
      Alert.alert('Err', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style='auto' />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

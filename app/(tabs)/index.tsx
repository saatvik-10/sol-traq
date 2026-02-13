import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getBalance } from '../../actions/getBalance';
import { getTokens } from '../../actions/getTokens';
import { getTxns } from '../../actions/getTxns';
import { short, timeAgo } from '../../utils/lib';
import { s } from '../../styles';

export default function WalletScreen() {
  const route = useRouter();
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

  const tryExample = () => {
    const example = '86xCnPeV69n6t3DnyGvkKobf9FdN2H9oiVDdaMpo2MMY';
    setAddress(example);
  };

  return (
    <SafeAreaProvider style={s.safe}>
      <ScrollView style={s.scroll}>
        <Text style={s.title}>$ol_traq</Text>
        <Text style={s.subtitle}>Explore any Solana wallet</Text>

        <View style={s.inputContainer}>
          <TextInput
            style={s.input}
            placeholder='Enter wallet address...'
            placeholderTextColor='#6B7280'
            value={address}
            onChangeText={setAddress}
            autoCapitalize='none'
            autoCorrect={false}
          />
        </View>

        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.btn, loading && s.btnDisabled]}
            onPress={search}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color='#000' />
            ) : (
              <Text style={s.btnText}>Search</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnGhost}
            onPress={tryExample}
            activeOpacity={0.7}
          >
            <Text style={s.btnGhostText}>Demo</Text>
          </TouchableOpacity>
        </View>

        {balance !== null && (
          <View style={s.card}>
            <Text style={s.label}>SOL Balance</Text>
            <Text style={s.balance}>{balance.toFixed(4)}</Text>
            <Text style={s.sol}>SOL</Text>
            <Text style={s.addr}>{short(address.trim(), 6)}</Text>
          </View>
        )}

        {tokens.length > 0 && (
          <>
            <Text style={s.section}>Tokens ({tokens.length})</Text>
            <FlatList
              data={tokens}
              keyExtractor={(t) => t.mint}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() => route.push(`/token/${item.mint}`)}
                  activeOpacity={0.7}
                >
                  <Text style={s.mint}>{short(item.mint, 6)}</Text>
                  <Text style={s.amount}>{item.amount}</Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}

        {txns.length > 0 && (
          <>
            <Text style={s.section}>Recent Transactions</Text>
            <FlatList
              data={txns}
              keyExtractor={(t) => t.sig}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.row}
                  onPress={() =>
                    Linking.openURL(`https://solscan.io/tx/${item.sig}`)
                  }
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={s.mint}>{short(item.sig, 8)}</Text>
                    <Text style={s.time}>
                      {item.time ? timeAgo(item.time) : 'pending'}
                    </Text>
                  </View>
                  <Text
                    style={[
                      s.statusIcon,
                      { color: item.ok ? '#14F195' : '#EF4444' },
                    ]}
                  >
                    {item.ok ? '+' : '-'}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaProvider>
  );
}

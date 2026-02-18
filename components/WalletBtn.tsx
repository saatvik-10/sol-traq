import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../styles';

interface WalletProps {
  isConnected: boolean;
  isConnecting: boolean;
  pubkey: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ConnectButton({
  isConnected,
  isConnecting,
  pubkey,
  onConnect,
  onDisconnect,
}: WalletProps) {
  if (isConnecting) {
    return (
      <View style={[s.button, s.connecting]}>
        <ActivityIndicator size='small' color='#fff' />
        <Text style={s.buttonText}>Connecting...</Text>
      </View>
    );
  }

  if (isConnected && pubkey) {
    return (
      <TouchableOpacity style={[s.button, s.connected]} onPress={onDisconnect}>
        <Ionicons name='wallet' size={18} color='#14F195' />
        <Text style={s.connectedText}>
          {pubkey.slice(0, 4)}...{pubkey.slice(-4)}
        </Text>
        <Ionicons name='close-circle-outline' size={16} color='#888' />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[s.button, s.disconnected]} onPress={onConnect}>
      <Ionicons name='wallet-outline' size={18} color='#fff' />
      <Text style={s.buttonText}>Connect Wallet</Text>
    </TouchableOpacity>
  );
}

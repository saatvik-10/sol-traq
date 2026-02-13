import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { s } from '../../styles';
import { rpc } from '../../handler/rpc';

export default function TokenScreen() {
  const { mint } = useLocalSearchParams<{ mint: string }>();
  const route = useRouter();

  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTokenInfo();
  }, [mint]);

  const fetchTokenInfo = async () => {
    try {
      const res = await rpc('getTokenSupply', [mint]);

      setTokenInfo({
        mint: mint,
        supply: res.result?.value?.uiAmount || 0,
        decimals: res.result?.value?.decimals || 0,
      });
    } catch (err) {
      console.log('Failed to fetch token info', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size={'large'} color={'#14F195'} />
      </View>
    );
  }

  return (
    <ScrollView style={s.container}>
      <TouchableOpacity style={s.backButton} onPress={() => route.back()}>
        <Ionicons name='arrow-back' size={24} color='#fff' />
        <Text style={s.backText}>Back</Text>
      </TouchableOpacity>

      <View style={s.header}>
        <Text style={s.title}>Token Details</Text>
      </View>

      <View style={s.card}>
        <Text style={s.cardLabel}>Mint Address</Text>
        <Text style={s.mintAddress}>{mint}</Text>
      </View>

      {tokenInfo && (
        <View style={s.card}>
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Total Supply</Text>
            <Text style={s.infoValue}>
              {tokenInfo.supply?.toLocaleString() || 'Unknown'}
            </Text>
          </View>
          <View style={s.divider} />
          <View style={s.infoRow}>
            <Text style={s.infoLabel}>Decimals</Text>
            <Text style={s.infoValue}>{tokenInfo.decimals}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={s.linkButton}
        onPress={() => {
          //linking later
        }}
      >
        <Text style={s.linkButtonText}>View on Solscan ↗</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

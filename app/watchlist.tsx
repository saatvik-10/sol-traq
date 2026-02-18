import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWalletStore } from '../stores/wallet-store';
import { rpc } from '../handler/rpc';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { s } from '../styles';
import { shortenAddress } from '../utils/lib';

interface WatchlistItem {
  address: string;
  balance: number | null;
  loading: boolean;
}

export default function WatchlistItem() {
  const route = useRouter();

  const favorites = useWalletStore((s) => s.favorites);
  const removeFavorite = useWalletStore((s) => s.removeFavorite);
  const isDevnet = useWalletStore((s) => s.isDevnet);

  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalances = useCallback(async () => {
    const result = await Promise.all(
      favorites.map(async (address) => {
        try {
          const res = await rpc('getBalance', [address]);

          return {
            address,
            balance: (res?.value || 0) / LAMPORTS_PER_SOL,
            loading: false,
          };
        } catch {
          return { address, balance: null, loading: false };
        }
      }),
    );
    setItems(result);
  }, [favorites, rpc]);

  useEffect(() => {
    if (favorites.length > 0) {
      setItems(
        favorites.map((a) => ({
          address: a,
          balance: null,
          loading: true,
        })),
      );
      fetchBalances();
    } else {
      setItems([]);
    }
  }, [favorites, fetchBalances]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchBalances();
    setIsRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.container}>
        <TouchableOpacity style={s.backButton} onPress={() => route.back()}>
          <Ionicons name='arrow-back' size={24} color='#FFFFFF' />
        </TouchableOpacity>

        <Text style={s.title}>Watchlist</Text>
        <Text style={s.subtitle}>
          {favorites.length} wallet{favorites.length !== 1 ? 's' : ''} ·{' '}
          {isDevnet ? 'Devnet' : 'Mainnet'}
        </Text>

        {favorites.length === 0 ? (
          <View style={s.emptyContainer}>
            <Ionicons name='heart-outline' size={64} color='#2A2A35' />
            <Text style={s.emptyTitle}>No Wallets Saved</Text>
            <Text style={s.emptyText}>
              Search for a wallet and tap the heart to save it here.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.address}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={onRefresh}
                tintColor='#14F195'
                colors={['#14F195']}
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={s.card}
                onLongPress={() => {
                  Alert.alert(
                    'Remove from Watchlist?',
                    shortenAddress(item.address),
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Remove',
                        style: 'destructive',
                        onPress: () => removeFavorite(item.address),
                      },
                    ],
                  );
                }}
              >
                <View style={s.cardLeft}>
                  <View style={s.iconBox}>
                    <Ionicons name='wallet' size={20} color='#14F195' />
                  </View>
                  <Text style={s.cardAddress} numberOfLines={1}>
                    {shortenAddress(item.address)}
                  </Text>
                </View>
                <View style={s.cardRight}>
                  {item.loading ? (
                    <ActivityIndicator size='small' color='#14F195' />
                  ) : item.balance !== null ? (
                    <Text style={s.cardBalance}>
                      {item.balance.toFixed(4)} SOL
                    </Text>
                  ) : (
                    <Text style={s.cardError}>Error</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

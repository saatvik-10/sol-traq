import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import WalletScreen from './app/(tabs)/index';
import SwapScreen from './app/(tabs)/swap';
import { s } from './styles';

export default function App() {
  const [activeTab, setActiveTab] = useState<'wallet' | 'swap'>('wallet');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        {activeTab === 'wallet' ? <WalletScreen /> : <SwapScreen />}

        <View style={s.tabBar}>
          <TouchableOpacity
            style={s.tab}
            onPress={() => setActiveTab('wallet')}
          >
            <Ionicons
              name={activeTab === 'wallet' ? 'wallet' : 'wallet-outline'}
              size={24}
              color={activeTab === 'wallet' ? '#14F195' : '#6B7280'}
            />
            <Text style={[s.tabLabel, activeTab === 'wallet' && s.tabActive]}>
              Wallet
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.tab} onPress={() => setActiveTab('swap')}>
            <Ionicons
              name={
                activeTab === 'swap'
                  ? 'swap-horizontal'
                  : 'swap-horizontal-outline'
              }
              size={24}
              color={activeTab === 'swap' ? '#14F195' : '#6B7280'}
            />
            <Text style={[s.tabLabel, activeTab === 'swap' && s.tabActive]}>
              Swap
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

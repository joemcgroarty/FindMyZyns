import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, ActivityIndicator } from 'react-native';
import { useStatusStore } from '@/stores/useStatusStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';

const statusConfig = {
  offline: { label: 'Offline', color: 'bg-dark-400', textColor: 'text-gray-400' },
  sharing: { label: 'Sharing', color: 'bg-primary', textColor: 'text-white' },
  needing: { label: 'Needing', color: 'bg-secondary', textColor: 'text-dark' },
};

export function StatusFAB() {
  const { status, setStatus, setSharingProduct } = useStatusStore();
  const { session } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const config = statusConfig[status];

  const handleStatusSelect = async (newStatus: 'offline' | 'sharing' | 'needing') => {
    if (newStatus === 'sharing') {
      setLoadingProducts(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', session?.user?.id ?? '');
      setProducts((data as Product[]) ?? []);
      setLoadingProducts(false);

      if (!data || data.length === 0) {
        setShowModal(false);
        // Could navigate to add product, but for now just close
        return;
      }
      setShowProducts(true);
    } else {
      await setStatus(newStatus);
      setSharingProduct(null);
      setShowModal(false);
    }
  };

  const handleProductSelect = async (product: Product) => {
    await setStatus('sharing', product.id);
    setSharingProduct(product);
    setShowProducts(false);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className={`absolute bottom-6 right-6 ${config.color} px-5 py-3 rounded-full shadow-lg flex-row items-center`}
        activeOpacity={0.8}
      >
        <View className={`w-2.5 h-2.5 rounded-full mr-2 ${status === 'offline' ? 'bg-gray-500' : status === 'sharing' ? 'bg-white' : 'bg-dark'}`} />
        <Text className={`${config.textColor} font-semibold text-sm`}>{config.label}</Text>
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => { setShowModal(false); setShowProducts(false); }}
        >
          <View className="mt-auto bg-dark-100 rounded-t-3xl p-6 pb-12">
            {!showProducts ? (
              <>
                <Text className="text-white text-lg font-bold mb-4">Set your status</Text>
                {(['offline', 'sharing', 'needing'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    onPress={() => handleStatusSelect(s)}
                    className={`flex-row items-center p-4 rounded-xl mb-2 ${status === s ? 'bg-dark-200 border border-primary' : 'bg-dark-200'}`}
                    activeOpacity={0.7}
                  >
                    <View className={`w-3 h-3 rounded-full mr-3 ${statusConfig[s].color}`} />
                    <View>
                      <Text className="text-white font-semibold">{statusConfig[s].label}</Text>
                      <Text className="text-gray-500 text-xs">
                        {s === 'offline' && 'You are invisible on the map'}
                        {s === 'sharing' && 'You appear on the map with your product'}
                        {s === 'needing' && 'Browse the map for sharers'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text className="text-white text-lg font-bold mb-4">What are you sharing?</Text>
                {loadingProducts ? (
                  <ActivityIndicator color="#10B981" />
                ) : (
                  <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() => handleProductSelect(item)}
                        className="bg-dark-200 p-4 rounded-xl mb-2"
                        activeOpacity={0.7}
                      >
                        <Text className="text-white font-semibold">{item.name}</Text>
                        <Text className="text-gray-500 text-xs">
                          {item.brand ? `${item.brand} \u00B7 ` : ''}{item.type}{item.strength ? ` \u00B7 ${item.strength}` : ''}
                        </Text>
                      </TouchableOpacity>
                    )}
                  />
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

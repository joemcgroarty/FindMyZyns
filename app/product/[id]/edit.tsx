import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Product } from '@/types';

const PRODUCT_TYPES = [
  { label: 'Pouches', value: 'pouches' },
  { label: 'Vape', value: 'vape' },
  { label: 'Cigarettes', value: 'cigarettes' },
  { label: 'Dip', value: 'dip' },
  { label: 'Snus', value: 'snus' },
  { label: 'Other', value: 'other' },
] as const;

export default function EditProductScreen() {
  const { session } = useAuthStore();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [type, setType] = useState<string>('pouches');
  const [flavor, setFlavor] = useState('');
  const [strength, setStrength] = useState('');
  const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        const product = data as Product;
        setName(product.name);
        setBrand(product.brand ?? '');
        setType(product.type);
        setFlavor(product.flavor ?? '');
        setStrength(product.strength ?? '');
        setExistingPhotoUrl(product.photo_url);
      }
      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!session?.user || !id) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Product name is required');
      return;
    }
    setNameError(null);

    setSaving(true);

    let photoUrl = existingPhotoUrl;

    if (imageUri) {
      const fileName = `${session.user.id}/${Date.now()}.jpg`;
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const arrayBuffer = await new Response(blob).arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);
        photoUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase
      .from('products')
      .update({
        name: trimmedName,
        brand: brand.trim() || null,
        type,
        flavor: flavor.trim() || null,
        strength: strength.trim() || null,
        photo_url: photoUrl,
      })
      .eq('id', id);

    setSaving(false);

    if (!error) {
      router.back();
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            await supabase.from('products').delete().eq('id', id);
            router.back();
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#10B981" size="large" />
      </SafeAreaView>
    );
  }

  const displayPhoto = imageUri ?? existingPhotoUrl;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 mb-6">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text className="text-primary text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Edit Product</Text>
            <View className="w-14" />
          </View>

          {/* Photo */}
          <TouchableOpacity
            onPress={pickImage}
            className="self-center mb-6"
            activeOpacity={0.7}
          >
            <View className="w-24 h-24 rounded-xl bg-dark-200 border-2 border-dashed border-dark-400 items-center justify-center overflow-hidden">
              {displayPhoto ? (
                <Image
                  source={{ uri: displayPhoto }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              ) : (
                <Text className="text-gray-500 text-sm text-center">
                  {'Add\nPhoto'}
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Form */}
          <Input
            label="Name *"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Wintergreen 6mg"
            error={nameError}
          />

          <Input
            label="Brand"
            value={brand}
            onChangeText={setBrand}
            placeholder="e.g. Zyn, Velo, On!"
          />

          {/* Type Picker */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-1.5 font-medium">Type</Text>
            <View className="bg-dark-200 rounded-xl overflow-hidden">
              <Picker
                selectedValue={type}
                onValueChange={setType}
                dropdownIconColor="#6B7280"
                style={{ color: '#FFFFFF' }}
              >
                {PRODUCT_TYPES.map((t) => (
                  <Picker.Item key={t.value} label={t.label} value={t.value} />
                ))}
              </Picker>
            </View>
          </View>

          <Input
            label="Flavor"
            value={flavor}
            onChangeText={setFlavor}
            placeholder="e.g. Wintergreen, Mint"
          />

          <Input
            label="Strength"
            value={strength}
            onChangeText={setStrength}
            placeholder="e.g. 6mg, Strong"
          />

          <View className="mt-4">
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
            />
          </View>

          <View className="mt-3 pb-8">
            <Button
              title="Delete Product"
              onPress={handleDelete}
              variant="danger"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

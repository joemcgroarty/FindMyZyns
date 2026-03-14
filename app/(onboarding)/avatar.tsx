import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';

export default function AvatarScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session, refreshProfile } = useAuthStore();

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

  const handleUpload = async () => {
    if (!imageUri || !session?.user) {
      router.push('/(onboarding)/tutorial');
      return;
    }

    setLoading(true);
    const fileName = `${session.user.id}/${Date.now()}.jpg`;
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const arrayBuffer = await new Response(blob).arrayBuffer();

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (uploadError) {
      setLoading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', session.user.id);

    await refreshProfile();
    setLoading(false);
    router.push('/(onboarding)/tutorial');
  };

  return (
    <View className="flex-1 bg-dark justify-center px-6">
      <View className="mb-8">
        <Text className="text-gray-500 text-sm mb-2">Step 2 of 3</Text>
        <Text className="text-white text-2xl font-bold mb-2">
          Add a profile photo
        </Text>
        <Text className="text-gray-400 text-base">
          Help others recognize you on the map
        </Text>
      </View>

      <TouchableOpacity
        onPress={pickImage}
        className="self-center mb-8"
        activeOpacity={0.7}
      >
        <View className="w-32 h-32 rounded-full bg-dark-200 border-2 border-dashed border-dark-400 items-center justify-center overflow-hidden">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full h-full"
              contentFit="cover"
            />
          ) : (
            <Text className="text-gray-500 text-sm text-center">
              Tap to{'\n'}choose photo
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <Button
        title={imageUri ? 'Upload & Continue' : 'Continue'}
        onPress={handleUpload}
        loading={loading}
      />

      {!imageUri && (
        <Button
          title="Skip for now"
          onPress={() => router.push('/(onboarding)/tutorial')}
          variant="outline"
          className="mt-3"
        />
      )}
    </View>
  );
}

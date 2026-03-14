import { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function EditProfileScreen() {
  const { profile, session, refreshProfile } = useAuthStore();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile?.display_name ?? '');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAvatarUrl = imageUri ?? profile?.avatar_url ?? null;

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
    if (!session?.user) return;

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError('Display name is required');
      return;
    }

    setSaving(true);
    setError(null);

    let avatarUrl = profile?.avatar_url ?? null;

    // Upload new avatar if changed
    if (imageUri) {
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
        setError('Failed to upload avatar');
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      avatarUrl = urlData.publicUrl;
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        display_name: trimmed,
        avatar_url: avatarUrl,
      })
      .eq('id', session.user.id);

    if (updateError) {
      setError('Failed to save profile');
      setSaving(false);
      return;
    }

    await refreshProfile();
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View className="flex-row items-center justify-between pt-4 mb-8">
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <Text className="text-primary text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
            <Text className="text-white text-lg font-bold">Edit Profile</Text>
            <View className="w-14" />
          </View>

          {/* Avatar */}
          <TouchableOpacity
            onPress={pickImage}
            className="self-center mb-8"
            activeOpacity={0.7}
          >
            <View className="w-28 h-28 rounded-full bg-dark-200 border-2 border-dashed border-dark-400 items-center justify-center overflow-hidden">
              {currentAvatarUrl ? (
                <Image
                  source={{ uri: currentAvatarUrl }}
                  className="w-full h-full"
                  contentFit="cover"
                />
              ) : (
                <Text className="text-gray-500 text-sm text-center">
                  {'Tap to\nchoose photo'}
                </Text>
              )}
            </View>
            <Text className="text-primary text-sm text-center mt-2">Change Photo</Text>
          </TouchableOpacity>

          {/* Display Name */}
          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your display name"
            autoCapitalize="words"
            error={error}
          />

          <View className="mt-6">
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

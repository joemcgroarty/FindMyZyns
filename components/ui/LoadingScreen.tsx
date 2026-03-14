import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View className="flex-1 bg-dark items-center justify-center">
      <ActivityIndicator size="large" color="#10B981" />
      {message && (
        <Text className="text-gray-400 mt-4 text-base">{message}</Text>
      )}
    </View>
  );
}

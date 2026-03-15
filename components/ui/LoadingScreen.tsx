import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' } as any}>
      <ActivityIndicator size="large" color="#10B981" />
      {message && (
        <Text className="text-gray-400 mt-4 text-base">{message}</Text>
      )}
    </View>
  );
}

import { View, Text, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface TutorialCardProps {
  title: string;
  description: string;
  emoji: string;
}

export function TutorialCard({ title, description, emoji }: TutorialCardProps) {
  return (
    <View
      className="items-center justify-center px-8"
      style={{ width }}
    >
      <Text className="text-6xl mb-6">{emoji}</Text>
      <Text className="text-white text-2xl font-bold text-center mb-3">
        {title}
      </Text>
      <Text className="text-gray-400 text-base text-center leading-6">
        {description}
      </Text>
    </View>
  );
}

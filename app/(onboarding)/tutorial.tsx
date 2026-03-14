import { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { TutorialCard } from '@/components/onboarding/TutorialCard';
import { Button } from '@/components/ui/Button';

const { width } = Dimensions.get('window');

const slides = [
  {
    emoji: '\uD83D\uDDFA\uFE0F',
    title: 'The Map',
    description:
      'See who is sharing nicotine near you in real-time. Find nearby stores too.',
  },
  {
    emoji: '\uD83E\uDD1D',
    title: 'Share & Connect',
    description:
      'Set your status to Sharing when you have nicotine to share, or Needing when you want some. Connect with others on the map.',
  },
  {
    emoji: '\u2B50',
    title: 'Earn Karma',
    description:
      'Share nicotine to earn karma points. Build your reputation and unlock badges. The more you give, the higher your status.',
  },
];

export default function TutorialScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const router = useRouter();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/(tabs)/map');
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <View className="flex-1 justify-center">
        <FlatList
          ref={flatListRef}
          data={slides}
          renderItem={({ item }) => <TutorialCard {...item} />}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setCurrentIndex(index);
          }}
          keyExtractor={(_, i) => i.toString()}
        />
      </View>

      <View className="flex-row justify-center mb-6">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`w-2 h-2 rounded-full mx-1 ${
              i === currentIndex ? 'bg-primary' : 'bg-dark-300'
            }`}
          />
        ))}
      </View>

      <View className="px-6 pb-12">
        <Button
          title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          onPress={handleNext}
        />
        {currentIndex < slides.length - 1 && (
          <Button
            title="Skip"
            onPress={() => router.replace('/(tabs)/map')}
            variant="outline"
            className="mt-3"
          />
        )}
      </View>
    </View>
  );
}

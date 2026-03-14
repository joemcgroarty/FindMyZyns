import { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  className = '',
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      className={`bg-dark-300 ${className}`}
      style={{ width, height, borderRadius, opacity }}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <View className="px-6 pt-8">
      <View className="items-center mb-6">
        <Skeleton width={96} height={96} borderRadius={48} />
        <View className="mt-3">
          <Skeleton width={120} height={20} />
        </View>
        <View className="mt-2">
          <Skeleton width={80} height={16} />
        </View>
      </View>
      <Skeleton height={60} className="mb-4" />
      <View className="flex-row gap-3 mb-6">
        <View className="flex-1"><Skeleton height={60} /></View>
        <View className="flex-1"><Skeleton height={60} /></View>
        <View className="flex-1"><Skeleton height={60} /></View>
      </View>
      <Skeleton height={24} className="mb-3" />
      <Skeleton height={70} className="mb-2" />
      <Skeleton height={70} className="mb-2" />
    </View>
  );
}

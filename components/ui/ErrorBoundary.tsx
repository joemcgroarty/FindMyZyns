import React from 'react';
import { View, Text } from 'react-native';
import { Button } from './Button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 bg-dark items-center justify-center px-6">
            <Text className="text-4xl mb-4">{'\u26A0\uFE0F'}</Text>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Something went wrong
            </Text>
            <Text className="text-gray-400 text-center text-base mb-6">
              An unexpected error occurred. Please try again.
            </Text>
            <Button
              title="Try Again"
              onPress={() => this.setState({ hasError: false })}
            />
          </View>
        )
      );
    }

    return this.props.children;
  }
}

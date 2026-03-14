import { TextInput, Text, View, TextInputProps } from 'react-native';
import { useState } from 'react';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string | null;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  containerClassName = '',
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <Text className="text-gray-400 text-sm mb-1.5 font-medium">
          {label}
        </Text>
      )}
      <TextInput
        className={`bg-dark-200 text-white px-4 py-3.5 rounded-xl text-base border ${
          error
            ? 'border-danger'
            : isFocused
              ? 'border-primary'
              : 'border-transparent'
        }`}
        placeholderTextColor="#6B7280"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {error && (
        <Text className="text-danger text-sm mt-1">{error}</Text>
      )}
    </View>
  );
}

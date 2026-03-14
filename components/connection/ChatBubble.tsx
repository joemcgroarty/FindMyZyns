import { View, Text } from 'react-native';
import { Message } from '@/types';
import { useAuthStore } from '@/stores/useAuthStore';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { session } = useAuthStore();
  const isOwn = message.sender_id === session?.user?.id;

  const timeString = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View
      className={`mb-2 max-w-[80%] ${isOwn ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`px-3.5 py-2.5 rounded-2xl ${
          isOwn
            ? 'bg-primary rounded-br-sm'
            : 'bg-dark-200 rounded-bl-sm'
        }`}
      >
        <Text className="text-white text-base">{message.body}</Text>
      </View>
      <Text
        className={`text-gray-500 text-[10px] mt-1 ${
          isOwn ? 'text-right' : 'text-left'
        }`}
      >
        {timeString}
      </Text>
    </View>
  );
}

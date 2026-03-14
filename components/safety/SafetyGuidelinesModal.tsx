import { View, Text, Modal, ScrollView } from 'react-native';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/useAuthStore';

interface SafetyGuidelinesModalProps {
  visible: boolean;
  onAcknowledge: () => void;
}

const guidelines = [
  { emoji: '\uD83D\uDCCD', title: 'Meet in public places', desc: 'Always meet in well-lit, populated areas like coffee shops or parks.' },
  { emoji: '\uD83D\uDCF1', title: 'Tell a friend', desc: 'Let someone know where you are going and who you are meeting.' },
  { emoji: '\uD83E\uDDE0', title: 'Trust your instincts', desc: 'If something feels off, leave. Your safety comes first.' },
  { emoji: '\uD83D\uDEA9', title: 'Report bad behavior', desc: 'Use the report feature if someone is inappropriate or makes you uncomfortable.' },
];

export function SafetyGuidelinesModal({ visible, onAcknowledge }: SafetyGuidelinesModalProps) {
  const { session, refreshProfile } = useAuthStore();

  const handleAcknowledge = async () => {
    if (session?.user) {
      await supabase
        .from('profiles')
        .update({ safety_acknowledged: true })
        .eq('id', session.user.id);
      await refreshProfile();
    }
    onAcknowledge();
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-dark">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <Text className="text-white text-2xl font-bold text-center mb-2">
            Stay Safe
          </Text>
          <Text className="text-gray-400 text-center text-base mb-8">
            Before connecting with others, please review these safety guidelines.
          </Text>

          {guidelines.map((g, i) => (
            <View key={i} className="flex-row items-start mb-5">
              <Text className="text-2xl mr-3">{g.emoji}</Text>
              <View className="flex-1">
                <Text className="text-white font-semibold text-base">{g.title}</Text>
                <Text className="text-gray-400 text-sm mt-0.5">{g.desc}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View className="px-6 pb-12">
          <Button title="I Understand" onPress={handleAcknowledge} />
        </View>
      </View>
    </Modal>
  );
}

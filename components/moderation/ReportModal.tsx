import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Button } from '@/components/ui/Button';
import { reportUser } from '@/lib/moderation';

const REASONS = [
  { value: 'inappropriate_behavior', label: 'Inappropriate behavior' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'spam_fake', label: 'Spam / Fake account' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'other', label: 'Other' },
];

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUsername: string;
  connectionId?: string;
}

export function ReportModal({
  visible,
  onClose,
  reportedUserId,
  reportedUsername,
  connectionId,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) return;
    setLoading(true);
    const success = await reportUser(reportedUserId, selectedReason, details, connectionId);
    setLoading(false);
    if (success) {
      Alert.alert(
        'Report submitted',
        `We'll review your report about @${reportedUsername} within 24 hours. This user has been blocked.`,
      );
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableOpacity className="flex-1 bg-black/50" activeOpacity={1} onPress={onClose}>
        <View className="mt-auto bg-dark-100 rounded-t-3xl p-6 pb-12" onStartShouldSetResponder={() => true}>
          <Text className="text-white text-lg font-bold mb-1">Report @{reportedUsername}</Text>
          <Text className="text-gray-400 text-sm mb-4">Select a reason for your report</Text>

          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason.value}
              onPress={() => setSelectedReason(reason.value)}
              className={`p-3 rounded-xl mb-2 ${selectedReason === reason.value ? 'bg-dark-200 border border-primary' : 'bg-dark-200'}`}
            >
              <Text className="text-white">{reason.label}</Text>
            </TouchableOpacity>
          ))}

          <TextInput
            className="bg-dark-200 text-white px-4 py-3 rounded-xl text-base mt-2 mb-4"
            placeholder="Additional details (optional)"
            placeholderTextColor="#6B7280"
            value={details}
            onChangeText={setDetails}
            multiline
            maxLength={2000}
          />

          <Button
            title="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            disabled={!selectedReason}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

import { supabase } from './supabase';
import { useAuthStore } from '@/stores/useAuthStore';

export async function blockUser(blockedId: string): Promise<boolean> {
  const userId = useAuthStore.getState().session?.user?.id;
  if (!userId) return false;

  const { error } = await supabase
    .from('blocks')
    .insert({ blocker_id: userId, blocked_id: blockedId });

  if (error) return false;

  // Cancel any active connections between them
  await supabase
    .from('connections')
    .update({ status: 'cancelled' })
    .or(`requester_id.eq.${blockedId},responder_id.eq.${blockedId}`)
    .in('status', ['pending', 'accepted']);

  return true;
}

export async function unblockUser(blockedId: string): Promise<boolean> {
  const userId = useAuthStore.getState().session?.user?.id;
  if (!userId) return false;

  const { error } = await supabase
    .from('blocks')
    .delete()
    .eq('blocker_id', userId)
    .eq('blocked_id', blockedId);

  return !error;
}

export async function getBlockedUsers(): Promise<string[]> {
  const userId = useAuthStore.getState().session?.user?.id;
  if (!userId) return [];

  const { data } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocker_id', userId);

  return (data ?? []).map((b) => b.blocked_id);
}

export async function reportUser(
  reportedId: string,
  reason: string,
  details?: string,
  connectionId?: string,
): Promise<boolean> {
  const userId = useAuthStore.getState().session?.user?.id;
  if (!userId) return false;

  const { error } = await supabase.from('reports').insert({
    reporter_id: userId,
    reported_id: reportedId,
    reason,
    details: details ?? null,
    connection_id: connectionId ?? null,
  });

  if (error) return false;

  // Auto-block after report
  await blockUser(reportedId);
  return true;
}

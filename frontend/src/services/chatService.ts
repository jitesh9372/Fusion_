import { supabase } from '@/lib/supabase';
import type { MessageItem } from '@/types/marketplace';

export interface RealtimeMessagePayload {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: MessageItem;
  old?: Partial<MessageItem>;
}

/**
 * Fetch messages for a specific user, optionally restricted to a specific conversation partner.
 * Returns an empty array when no data exists — no mock fallbacks.
 */
export const fetchMessages = async (
  userId: string,
  targetUserId?: string
): Promise<MessageItem[]> => {
  try {
    let query = supabase.from('messages').select('*').order('created_at', { ascending: true });

    if (targetUserId) {
      query = query.or(
        `and(sender_id.eq.${userId},receiver_id.eq.${targetUserId}),and(sender_id.eq.${targetUserId},receiver_id.eq.${userId})`
      );
    } else {
      query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('[fetchMessages] Supabase error:', error.message);
      return [];
    }

    return (data as MessageItem[]) ?? [];
  } catch (err) {
    console.error('[fetchMessages] Failed:', err);
    return [];
  }
};

/**
 * Send a new chat message to Supabase
 */
export const sendMessage = async (
  message: Omit<MessageItem, 'id' | 'created_at' | 'is_read'>
): Promise<MessageItem> => {
  const tempId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const optimisticMsg: MessageItem = {
    ...message,
    id: tempId,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        booking_id: message.booking_id ?? null,
        sender_id: message.sender_id,
        receiver_id: message.receiver_id,
        sender_name: message.sender_name,
        content: message.content,
        is_read: false,
      })
      .select()
      .single();

    if (error || !data) {
      console.warn('[sendMessage] Supabase error, returning optimistic:', error);
      return optimisticMsg;
    }
    return data as MessageItem;
  } catch (err) {
    console.error('[sendMessage] Exception:', err);
    return optimisticMsg;
  }
};

/**
 * Subscribe to real-time incoming messages and updates for a specific user
 */
export const subscribeToMessages = (
  userId: string,
  callback: (payload: RealtimeMessagePayload) => void
): (() => void) => {
  try {
    const channelId = `chat_realtime_${userId}_${Math.random().toString(36).substring(2, 8)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
        },
        payload => {
          const item = (payload.new || payload.old) as MessageItem;
          // Only dispatch if the message is relevant to the current user
          if (
            item &&
            (item.sender_id === userId || item.receiver_id === userId || !userId)
          ) {
            callback({
              eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
              new: payload.new as MessageItem,
              old: payload.old as Partial<MessageItem>,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.error('[subscribeToMessages] Subscription error:', err);
    return () => {};
  }
};

/**
 * Mark messages as read by receiver
 */
export const markMessagesAsRead = async (
  messageIds: string[],
  receiverId: string
): Promise<boolean> => {
  if (!messageIds || messageIds.length === 0) return true;
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .eq('receiver_id', receiverId);

    return !error;
  } catch {
    return false;
  }
};

/**
 * Mark all unread messages from a specific sender as read
 */
export const markConversationAsRead = async (
  currentUserId: string,
  senderId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', senderId)
      .eq('is_read', false);

    return !error;
  } catch {
    return false;
  }
};

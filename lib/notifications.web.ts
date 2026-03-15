// Web push notifications — simplified browser Notification API
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!('Notification' in window)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return null;

  // On web, we don't have Expo push tokens
  // Return a placeholder — in production, you'd use Web Push API with VAPID keys
  return `web-${userId}`;
}

export function addNotificationResponseListener(
  handler: (response: any) => void,
) {
  // No-op on web — notifications are handled by the browser
  return { remove: () => {} };
}

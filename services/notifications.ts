import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { ScheduledReminder } from '@/domain/reminders';

const CHANNEL = 'pengingat';

export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync(CHANNEL, {
      name: 'Pengingat amalan',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#EC4899',
    });
  }
}

/** Asks only when not yet decided; returns whether notifications may be shown. */
export async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function hasPermission(): Promise<boolean> {
  return (await Notifications.getPermissionsAsync()).granted;
}

/** Replaces every pending reminder with `list`; this app schedules nothing else. */
export async function replaceScheduled(list: ScheduledReminder[]): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const r of list) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: { title: r.title, body: r.body },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: CHANNEL },
    });
  }
}

import Constants from 'expo-constants';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { REMINDER_SOUNDS, reminderSoundOf, type ReminderSoundId } from '@/domain/reminderSound';
import type { ScheduledReminder } from '@/domain/reminders';

/** Matches the `channelId` the database sends with every group push. */
const GROUP_CHANNEL = 'grup';

export function configureNotifications(sound: ReminderSoundId = 'default'): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: sound !== 'sunyi',
      shouldSetBadge: false,
    }),
  });
  void ensureChannels();
}

/**
 * Android drops a notification whose channel does not exist yet, and channel creation is a
 * separate async call, so every scheduling path waits on this first. Creating one twice is a
 * no-op for name/description, but sound is fixed at creation time, so each bundled sound gets
 * its own channel (`pengingat-lembut`, …). The user can also retune any channel to their own
 * ringtone in Android Settings; we never delete channels so that choice survives.
 */
async function ensureChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;
  for (const s of REMINDER_SOUNDS) {
    const input: Notifications.NotificationChannelInput = {
      name: s.id === 'default' ? 'Pengingat amalan' : `Pengingat · ${s.label}`,
      importance:
        s.id === 'sunyi' ? Notifications.AndroidImportance.DEFAULT : Notifications.AndroidImportance.HIGH,
      lightColor: '#EC4899',
      vibrationPattern: s.id === 'sunyi' ? [] : [0, 250, 250, 250],
    };
    if (s.file) input.sound = s.file;
    if (s.id === 'sunyi') input.sound = null;
    await Notifications.setNotificationChannelAsync(s.channelId, input);
  }
  await Notifications.setNotificationChannelAsync(GROUP_CHANNEL, {
    name: 'Kabar grup',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#EC4899',
  });
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

/** Replaces every pending reminder with `list`, played through the chosen sound channel. */
export async function replaceScheduled(list: ScheduledReminder[], sound: ReminderSoundId = 'default'): Promise<void> {
  const pick = reminderSoundOf(sound);
  await ensureChannels();
  await Notifications.cancelAllScheduledNotificationsAsync();
  for (const r of list) {
    await Notifications.scheduleNotificationAsync({
      identifier: r.id,
      content: {
        title: r.title,
        body: r.body,
        sound:
          pick.id === 'sunyi'
            ? false
            : typeof pick.file === 'string'
              ? pick.file
              : Platform.OS === 'ios'
                ? 'default'
                : undefined,
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: r.date, channelId: pick.channelId },
    });
  }
}

/**
 * Opens the Android settings page for this sound's channel, where the user can pick any
 * ringtone on the device. iOS has no per-channel page, so this is a no-op there.
 */
export async function openReminderSoundSettings(sound: ReminderSoundId): Promise<void> {
  if (Platform.OS !== 'android') return;
  const pkg = Constants.expoConfig?.android?.package ?? 'com.amalify.app';
  await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.CHANNEL_NOTIFICATION_SETTINGS, {
    extra: {
      'android.provider.extra.APP_PACKAGE': pkg,
      'android.provider.extra.CHANNEL_ID': reminderSoundOf(sound).channelId,
    },
  });
}

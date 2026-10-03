import { SYNC_LABEL } from '@/components/settings/AccountCard';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { Screen } from '@/components/ui/Screen';
import { FLOWERS } from '@/domain/flowers';
import { useRewards } from '@/hooks/useRewards';
import { useAuth } from '@/providers/AuthProvider';
import { useLogs } from '@/providers/LogsProvider';
import { usePrayer } from '@/providers/PrayerProvider';
import { useReminders } from '@/providers/ReminderProvider';
import { reminderSoundOf } from '@/domain/reminderSound';
import { GENDER_LABEL } from '@/domain/profile';
import { useTheme } from '@/providers/ThemeProvider';
import { useProfile } from '@/providers/ProfileProvider';

/** The settings menu; each row opens its own page. */
export default function SettingsScreen() {
  const { user } = useAuth();
  const { sync, plan } = useLogs();
  const { flower } = useTheme();
  const { effective } = useProfile();
  const { balance } = useRewards();
  const { city, adzan } = usePrayer();
  const { evening, sound } = useReminders();

  const flowerName = FLOWERS.find((f) => f.id === flower)?.name ?? '';

  return (
    <Screen title="Pengaturan">
      <SettingsRow
        number={1}
        title="Akun & sinkron"
        summary={user ? `${user.user.email} · ${GENDER_LABEL[effective]} · ${SYNC_LABEL[sync]}` : `${GENDER_LABEL[effective]} · ${SYNC_LABEL[sync]}`}
        href="/settings/akun"
      />
      <SettingsRow number={2} title="Toko" summary={`${balance} poin · ${flowerName}`} href="/shop" />
      <SettingsRow
        number={3}
        title="Sholat & adzan"
        summary={city ? `${city.name} · adzan ${adzan ? 'aktif' : 'mati'}` : 'Pilih kota'}
        href="/settings/sholat"
      />
      <SettingsRow
        number={4}
        title="Pengingat"
        summary={evening.enabled ? `Malam ${evening.time} · ${reminderSoundOf(sound).label}` : `Malam mati · ${reminderSoundOf(sound).label}`}
        href="/settings/pengingat"
      />
      <SettingsRow number={5} title="Atur amalan" summary={`${plan.items.length} pribadi · Pribadi / Grup`} href="/atur-amalan" />
    </Screen>
  );
}

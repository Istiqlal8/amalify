import { useCallback } from 'react';
import { Alert } from 'react-native';

import { PRAYERS, todayOf } from '@/domain/prayer';
import { prayersDueOnSuci } from '@/domain/suciPrayers';
import { useLogs } from '@/providers/LogsProvider';
import { usePrayer } from '@/providers/PrayerProvider';

const nameOf = (id: string): string => PRAYERS.find((p) => p.id === id)?.name ?? id;

/** "Sudah suci" with a confirm, then tells which prayers are due from this moment on. */
export function useSuciConfirm(): () => void {
  const { endHaid } = useLogs();
  const { days } = usePrayer();
  return useCallback(() => {
    Alert.alert('Sudah suci?', 'Sholat dihitung lagi mulai hari ini.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Sudah suci',
        onPress: () => {
          endHaid();
          const now = new Date();
          const today = todayOf(days, now);
          if (!today) return;
          const due = prayersDueOnSuci(today, now).map(nameOf);
          const subuhNote = due[0] === 'Subuh' ? ' jika suci sebelum matahari terbit' : '';
          Alert.alert(
            'Mandi wajib, lalu sholat',
            `Menurut mazhab Syafi'i, yang wajib dikerjakan: ${due.join(' dan ')}${subuhNote}.`,
          );
        },
      },
    ]);
  }, [endHaid, days]);
}

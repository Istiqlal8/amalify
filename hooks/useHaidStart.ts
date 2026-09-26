import { useCallback } from 'react';
import { Alert } from 'react-native';

import { MIN_SUCI_DAYS, suciDays } from '@/domain/haid';
import { useLogs } from '@/providers/LogsProvider';

/** Starts haid, first asking when fewer than 15 days of suci have passed (then it is istihadah). */
export function useHaidStart(): () => void {
  const { haid, today, startHaid } = useLogs();
  return useCallback(() => {
    const suci = suciDays(haid, today);
    if (suci === null || suci >= MIN_SUCI_DAYS) return startHaid();
    Alert.alert(
      'Belum 15 hari suci',
      `Baru ${suci} hari sejak haid terakhir. Menurut mazhab Syafi'i, darah sebelum 15 hari suci adalah istihadah, jadi sholat dan puasa tetap wajib.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Tetap tandai haid', onPress: startHaid },
      ],
    );
  }, [haid, today, startHaid]);
}

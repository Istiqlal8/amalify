import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { space } from '@/constants/theme';
import { unlockHaid, useHaidLock } from '@/hooks/useHaidLock';

/** Hides the haid menu behind the phone lock when the user turned the lock on. */
export function HaidLockGate({ children }: { children: ReactNode }) {
  const { locked, loaded } = useHaidLock();
  useEffect(() => {
    if (loaded && locked) unlockHaid();
  }, [loaded, locked]);
  if (!loaded) return null;
  if (!locked) return children;
  return (
    <View style={styles.center}>
      <Txt variant="heading">Menu Haid terkunci</Txt>
      <ClayButton label="Buka" onPress={unlockHaid} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', padding: space.lg, gap: space.md },
});

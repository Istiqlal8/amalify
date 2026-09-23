import { Pressable, StyleSheet, View } from 'react-native';

import { stepFor } from '@/components/CountItem';
import { ClayButton } from '@/components/ui/ClayButton';
import { Txt } from '@/components/ui/Txt';
import { clayOf, type Palette, radius, space } from '@/constants/theme';
import { formatDay } from '@/domain/cycle';
import { dateKey } from '@/domain/dayLog';
import { eventRatio, eventStatus, STATUS_LABELS, type GroupEvent } from '@/domain/groupEvent';
import { formatClock } from '@/domain/reminders';
import { useStyles } from '@/hooks/useStyles';
import { useTheme } from '@/providers/ThemeProvider';

type Props = {
  event: GroupEvent;
  picName: string | null;
  mine: boolean;
  onProgress: (value: number) => void;
  onRemove: () => void;
};

function when(iso: string): string {
  const d = new Date(iso);
  return `${formatDay(dateKey(d))} · ${formatClock(d.getHours(), d.getMinutes())}`;
}

export function EventCard({ event, picName, mine, onProgress, onRemove }: Props) {
  const styles = useStyles(makeStyles);
  const { colors } = useTheme();
  const status = eventStatus(event, new Date());
  const counted = event.target > 1 || event.unit !== '';
  const step = stepFor(event.target);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Txt variant="heading" style={styles.flex}>
          {event.title}
        </Txt>
        <View style={[styles.badge, status === 'terlaksana' && styles.done]}>
          <Txt variant="caption" style={status === 'terlaksana' ? { color: colors.onPrimary } : undefined}>
            {STATUS_LABELS[status]}
          </Txt>
        </View>
      </View>
      <Txt variant="caption">
        {when(event.startsAt)} · PIC {picName ?? '-'}
      </Txt>
      {counted ? (
        <>
          <Txt variant="bold">
            {event.progress} / {event.target} {event.unit}
          </Txt>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${eventRatio(event) * 100}%` }]} />
          </View>
          <View style={styles.row}>
            <ClayButton label={`-${step}`} tone="soft" disabled={event.progress === 0} onPress={() => onProgress(Math.max(0, event.progress - step))} />
            <ClayButton label={`+${step}`} onPress={() => onProgress(event.progress + step)} />
          </View>
        </>
      ) : (
        <ClayButton
          label={event.progress >= 1 ? 'Batalkan terlaksana' : 'Tandai terlaksana'}
          tone={event.progress >= 1 ? 'soft' : 'primary'}
          onPress={() => onProgress(event.progress >= 1 ? 0 : 1)}
        />
      )}
      {mine && (
        <Pressable accessibilityRole="button" onPress={onRemove} style={styles.remove}>
          <Txt variant="caption" style={{ color: colors.destructive }}>
            Hapus
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    card: { ...clayOf(c), padding: space.md, gap: space.sm },
    head: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
    flex: { flex: 1 },
    badge: { paddingHorizontal: space.sm, paddingVertical: 2, borderRadius: radius.pill, backgroundColor: c.muted },
    done: { backgroundColor: c.primaryDeep },
    track: { height: 8, borderRadius: radius.pill, backgroundColor: c.muted, overflow: 'hidden' },
    fill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.primary },
    row: { flexDirection: 'row', gap: space.sm },
    remove: { alignSelf: 'flex-end', minHeight: 44, justifyContent: 'center', paddingHorizontal: space.sm },
  });

import { useState } from 'react';
import { StyleSheet, View, type GestureResponderEvent } from 'react-native';

import { Txt } from '@/components/ui/Txt';
import { type Palette, radius, space } from '@/constants/theme';
import { formatTime } from '@/domain/murottal';
import { useStyles } from '@/hooks/useStyles';
import { useMurottal, useMurottalStatus } from '@/providers/MurottalProvider';

/** Tap or drag along the track to jump; the thumb follows the finger until release. */
export function SeekBar({ light = false }: { light?: boolean }) {
  const styles = useStyles(makeStyles);
  const tint = light ? { fill: '#FFFFFF', track: 'rgba(255, 255, 255, 0.3)', text: { color: 'rgba(255, 255, 255, 0.8)' } } : null;
  const { player } = useMurottal();
  const { currentTime, duration } = useMurottalStatus();
  const [width, setWidth] = useState(1);
  const [dragging, setDragging] = useState<number | null>(null);
  const shown = dragging ?? currentTime;
  const ratio = duration > 0 ? Math.min(1, shown / duration) : 0;

  const timeAt = (e: GestureResponderEvent): number =>
    Math.max(0, Math.min(1, e.nativeEvent.locationX / width)) * duration;

  return (
    <View style={styles.wrap}>
      <View
        style={styles.hit}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width || 1)}
        onStartShouldSetResponder={() => duration > 0}
        onResponderGrant={(e) => setDragging(timeAt(e))}
        onResponderMove={(e) => setDragging(timeAt(e))}
        onResponderRelease={(e) => {
          player.seekTo(timeAt(e));
          setDragging(null);
        }}
        accessibilityRole="adjustable"
        accessibilityLabel="Posisi">
        <View style={[styles.track, tint && { backgroundColor: tint.track }]}>
          <View style={[styles.fill, { width: `${ratio * 100}%` }, tint && { backgroundColor: tint.fill }]} />
        </View>
        <View style={[styles.thumb, { left: ratio * width - 7 }, tint && { backgroundColor: tint.fill }]} />
      </View>
      <View style={styles.times}>
        <Txt variant="caption" style={tint?.text}>{formatTime(shown)}</Txt>
        <Txt variant="caption" style={tint?.text}>{duration > 0 ? formatTime(duration) : '--:--'}</Txt>
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { gap: space.xs },
    hit: { height: 28, justifyContent: 'center' },
    track: { height: 4, borderRadius: radius.pill, backgroundColor: c.border, overflow: 'hidden' },
    fill: { height: 4, backgroundColor: c.primaryDeep },
    thumb: { position: 'absolute', width: 14, height: 14, borderRadius: 7, backgroundColor: c.primaryDeep },
    times: { flexDirection: 'row', justifyContent: 'space-between' },
  });

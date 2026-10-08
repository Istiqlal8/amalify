import type { ReactNode } from 'react';
import { Component } from 'react';
import { PanResponder, Pressable, StyleSheet, type GestureResponderEvent, type GestureResponderHandlers, type StyleProp, type ViewStyle, View } from 'react-native';

type GestureModule = typeof import('react-native-gesture-handler');

let cached: GestureModule | null | undefined;

/**
 * Loads `react-native-gesture-handler` once. Its native side can be missing or out of step with the
 * JS on an Expo Go session or an older dev build; when that happens the import can throw, which used
 * to take the whole garden down to the error boundary. Here it becomes a silent fallback to plain
 * React Native gestures instead.
 */
export function gestureModule(): GestureModule | null {
  if (cached !== undefined) return cached;
  try {
    // Lazy so a broken native module is a caught error, not a module-eval crash.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('react-native-gesture-handler') as GestureModule;
    // Reading a gesture factory is what actually touches the native bindings; if they are missing
    // this throws and we fall back. The cast keeps the always-defined types from hiding that.
    const probe = (mod as { Gesture?: { Pan?: unknown }; GestureDetector?: unknown });
    cached = probe?.Gesture?.Pan && probe?.GestureDetector ? mod : null;
  } catch {
    cached = null;
  }
  return cached;
}

/**
 * Catches a render-time failure from a native gesture view and renders `fallback` instead, so a
 * mismatched native module degrades to plain React Native rather than crashing the whole screen.
 */
class GestureBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

type PadProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Touch position relative to the pad's top-left corner. */
  onPoint: (x: number, y: number) => void;
  /** Touch lifted or cancelled. */
  onRelease: () => void;
  onGrab?: () => void;
  accessibilityLabel?: string;
};

/**
 * An analog pad. Native pan gesture when available — that is what lets a second finger press
 * "Naik"/"Lompat" at the same time. Falls back to `PanResponder` (single touch) when the native
 * module is unusable, so the joystick still works rather than crashing the screen.
 */
export function PanPad({ children, style, onPoint, onRelease, onGrab, accessibilityLabel }: PadProps) {
  const mod = gestureModule();
  const fallback = (
    <PanFallback style={style} onPoint={onPoint} onRelease={onRelease} onGrab={onGrab} accessibilityLabel={accessibilityLabel}>
      {children}
    </PanFallback>
  );
  if (!mod) return fallback;
  const pan = mod.Gesture.Pan()
    .minDistance(0)
    .shouldCancelWhenOutside(false)
    .onBegin((e) => {
      onGrab?.();
      onPoint(e.x, e.y);
    })
    .onUpdate((e) => onPoint(e.x, e.y))
    .onFinalize(() => onRelease());
  return (
    <GestureBoundary fallback={fallback}>
      <mod.GestureDetector gesture={pan}>
        <View style={style} accessible accessibilityLabel={accessibilityLabel}>
          {children}
        </View>
      </mod.GestureDetector>
    </GestureBoundary>
  );
}

/** The plain React Native pad used when gesture-handler is unavailable or failed to render. */
function PanFallback({ children, style, onPoint, onRelease, onGrab, accessibilityLabel }: PadProps) {
  const handlers = makeFallbackResponder(onPoint, onGrab, onRelease);
  return (
    <View style={style} accessible accessibilityLabel={accessibilityLabel} {...handlers}>
      {children}
    </View>
  );
}

function makeFallbackResponder(onPoint: PadProps['onPoint'], onGrab?: () => void, onRelease?: () => void): GestureResponderHandlers {
  return PanResponder.create({
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponderCapture: () => true,
    onPanResponderGrant: (e: GestureResponderEvent) => {
      onGrab?.();
      onPoint(e.nativeEvent.locationX, e.nativeEvent.locationY);
    },
    onPanResponderMove: (e: GestureResponderEvent) => onPoint(e.nativeEvent.locationX, e.nativeEvent.locationY),
    onPanResponderRelease: () => onRelease?.(),
    onPanResponderTerminate: () => onRelease?.(),
  }).panHandlers;
}

/** A button that taps through its own native gesture when possible, else a plain Pressable. */
export function TapPad({ children, style, onPress, accessibilityLabel }: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress: () => void; accessibilityLabel?: string }) {
  const mod = gestureModule();
  const fallback = (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={style}>
      {children}
    </Pressable>
  );
  if (!mod) return fallback;
  const tap = mod.Gesture.Tap().onEnd((_e, success) => {
    if (success) onPress();
  });
  return (
    <GestureBoundary fallback={fallback}>
      <mod.GestureDetector gesture={tap}>
        <View accessible accessibilityRole="button" accessibilityLabel={accessibilityLabel} style={style}>
          {children}
        </View>
      </mod.GestureDetector>
    </GestureBoundary>
  );
}

/**
 * The root a gesture-handler app normally wraps itself in. When the native module is unusable this
 * is just a plain full-bleed View, so the app renders instead of crashing at startup.
 */
export function GestureRoot({ children }: { children: ReactNode }) {
  const mod = gestureModule();
  const fallback = <View style={stylesFill.root}>{children}</View>;
  if (!mod) return fallback;
  return (
    <GestureBoundary fallback={fallback}>
      <mod.GestureHandlerRootView style={stylesFill.root}>{children}</mod.GestureHandlerRootView>
    </GestureBoundary>
  );
}

const stylesFill = StyleSheet.create({ root: { flex: 1 } });

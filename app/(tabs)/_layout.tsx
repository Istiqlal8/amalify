import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { BottomTabBar, Tabs } from 'expo-router/tabs';
import { View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MiniPlayer } from '@/components/murottal/MiniPlayer';
import { fonts, radius } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type IconName = SymbolViewProps['name'];

function icon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <SymbolView name={name} tintColor={color} size={24} />;
  };
}

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      tabBar={(props) => (
        // Overlays the screen so content scrolls behind the translucent pill.
        <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
          <MiniPlayer />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarActiveBackgroundColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarItemStyle: { borderRadius: radius.pill, marginVertical: 6, marginHorizontal: 4, overflow: 'hidden' },
        // Floating pill in the style of the iOS tab bar: inset from the edges, lifted above the home indicator.
        tabBarStyle: {
          height: 64,
          paddingTop: 0,
          paddingBottom: 0,
          paddingHorizontal: 4,
          marginHorizontal: 16,
          marginBottom: insets.bottom + 8,
          borderRadius: radius.pill,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.9)',
          backgroundColor: 'rgba(255,255,255,0.72)',
          boxShadow: `0px 8px 24px ${colors.shadow}`,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Beranda', tabBarIcon: icon({ ios: 'house.fill', android: 'home', web: 'home' }) }}
      />
      <Tabs.Screen
        name="quran"
        options={{ title: 'Quran', tabBarIcon: icon({ ios: 'book.fill', android: 'menu_book', web: 'menu_book' }) }}
      />
      <Tabs.Screen
        name="garden"
        options={{ href: null, title: 'Kebun', tabBarIcon: icon({ ios: 'leaf.fill', android: 'potted_plant', web: 'potted_plant' }) }}
      />
      <Tabs.Screen
        name="group"
        options={{ title: 'Grup', tabBarIcon: icon({ ios: 'person.3.fill', android: 'group', web: 'group' }) }}
      />
      <Tabs.Screen
        name="account"
        options={{ title: 'Pengaturan', tabBarIcon: icon({ ios: 'gearshape.fill', android: 'settings', web: 'settings' }) }}
      />
    </Tabs>
  );
}

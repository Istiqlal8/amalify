import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { fonts } from '@/constants/theme';
import { useTheme } from '@/providers/ThemeProvider';

type IconName = SymbolViewProps['name'];

function icon(name: IconName) {
  return function TabIcon({ color }: { color: ColorValue }) {
    return <SymbolView name={name} tintColor={color} size={24} />;
  };
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border, borderTopWidth: 2 },
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
        options={{ title: 'Kebun', tabBarIcon: icon({ ios: 'leaf.fill', android: 'potted_plant', web: 'potted_plant' }) }}
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

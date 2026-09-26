import { useCallback, useState } from 'react';
import { FlatList, useWindowDimensions, type ViewToken } from 'react-native';

import { TOTAL_PAGES } from '@/domain/tilawah';

import { AyahSheet } from './AyahSheet';
import { MushafPage } from './MushafPage';

const PAGES = Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1);

type Props = { startPage: number; colored: boolean; onPage: (page: number) => void };

/** Swipeable Madani mushaf; like a printed copy, the next page lies to the left. */
export function MushafView({ startPage, colored, onPage }: Props) {
  const { width } = useWindowDimensions();
  const [picked, setPicked] = useState<{ surah: number; ayah: number } | null>(null);
  const onAyah = useCallback((surah: number, ayah: number) => setPicked({ surah, ayah }), []);
  // FlatList rejects a changing onViewableItemsChanged, so it is created once.
  const [onViewable] = useState(() => ({ viewableItems }: { viewableItems: ViewToken<number>[] }) => {
    const first = viewableItems[0]?.item;
    if (first) onPage(first);
  });

  return (
    <>
      <FlatList
        data={PAGES}
        horizontal
        inverted
        pagingEnabled
        keyExtractor={String}
        initialScrollIndex={startPage - 1}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item }) => <MushafPage page={item} colored={colored} onAyah={onAyah} />}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        windowSize={3}
        initialNumToRender={1}
        maxToRenderPerBatch={2}
        showsHorizontalScrollIndicator={false}
      />
      {picked && <AyahSheet surah={picked.surah} ayah={picked.ayah} onClose={() => setPicked(null)} />}
    </>
  );
}

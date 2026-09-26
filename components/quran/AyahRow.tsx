import { memo } from 'react';

import type { ReaderPrefs } from '@/hooks/useReaderPrefs';
import type { Ayah } from '@/services/quranApi';
import type { TajweedAyah } from '@/services/quranComApi';

import { AyahCard } from './AyahCard';
import { AyahPlayButton } from './AyahPlayButton';
import { TafsirPanel } from './TafsirPanel';
import { TajweedText } from './TajweedText';
import { WordByWord } from './WordByWord';

type Props = {
  surah: number;
  ayah: Ayah;
  /** quran.com data for this ayah; absent until loaded or when neither tajwid nor per-kata is on. */
  extra?: TajweedAyah;
  prefs: ReaderPrefs;
  playing: boolean;
  onPlay: (ayah: number) => void;
};

function AyahRowBase({ surah, ayah, extra, prefs, playing, onPlay }: Props) {
  const arabic = !extra ? undefined : prefs.perKata ? (
    <WordByWord words={extra.words} colored={prefs.tajweed} />
  ) : prefs.tajweed ? (
    <TajweedText markup={extra.tajweed} colored />
  ) : undefined;
  return (
    <AyahCard ayah={ayah} arabic={arabic} active={playing} showLatin={prefs.latin} showArti={prefs.terjemah}>
      <TafsirPanel
        surah={surah}
        ayat={ayah.nomor}
        leading={<AyahPlayButton playing={playing} onPress={() => onPlay(ayah.nomor)} />}
      />
    </AyahCard>
  );
}

export const AyahRow = memo(AyahRowBase);

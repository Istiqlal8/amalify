import { useTodayMood } from '@/hooks/useTodayMood';

import { HomeCard } from './HomeCard';
import { MoodPicker } from './MoodPicker';
import { MoodVerse } from './MoodVerse';

/**
 * Asks once a day how the user feels; one tap swaps the question for an ayah, and the whole card is
 * gone once they leave the tab or the app.
 */
export function MoodCheck() {
  const { stage, mood, choose } = useTodayMood();
  if (stage === 'loading' || stage === 'done') return null;
  return <HomeCard>{stage === 'answered' && mood ? <MoodVerse mood={mood} /> : <MoodPicker onChoose={choose} />}</HomeCard>;
}

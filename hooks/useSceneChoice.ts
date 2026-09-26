import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { sceneById, SCENES, type Scene } from '@/components/murottal/scenes';

const KEY = 'amalify.murottal.scene.v1';

/** The player backdrop, remembered on this device. */
export function useSceneChoice(): { scene: Scene; setScene: (id: string) => void } {
  const [scene, setSceneState] = useState<Scene>(SCENES[0]);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((id) => id && setSceneState(sceneById(id)));
  }, []);

  const setScene = useCallback((id: string) => {
    setSceneState(sceneById(id));
    AsyncStorage.setItem(KEY, id);
  }, []);

  return { scene, setScene };
}

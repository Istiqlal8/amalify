import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'amalify.hideProgress.v1';

// Read synchronously by the group push, so it is cached once loaded.
let hidden = false;
AsyncStorage.getItem(KEY).then((raw) => {
  hidden = raw === '1';
});

export function isProgressHidden(): boolean {
  return hidden;
}

export async function setProgressHidden(value: boolean): Promise<void> {
  hidden = value;
  await AsyncStorage.setItem(KEY, value ? '1' : '0');
}

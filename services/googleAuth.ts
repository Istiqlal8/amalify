import { GoogleSignin, type User } from '@react-native-google-signin/google-signin';

const DRIVE_APPDATA = 'https://www.googleapis.com/auth/drive.appdata';

export function configureGoogle(): void {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    scopes: [DRIVE_APPDATA],
  });
}

export async function signInGoogle(): Promise<User | null> {
  await GoogleSignin.hasPlayServices();
  const res = await GoogleSignin.signIn();
  return res.type === 'success' ? res.data : null;
}

export async function restoreGoogle(): Promise<User | null> {
  if (!GoogleSignin.hasPreviousSignIn()) return null;
  const res = await GoogleSignin.signInSilently();
  return res.type === 'success' ? res.data : null;
}

export async function signOutGoogle(): Promise<void> {
  await GoogleSignin.signOut();
}

/** Access tokens expire after an hour; getTokens refreshes them. */
export async function googleTokens(): Promise<{ accessToken: string; idToken: string }> {
  return GoogleSignin.getTokens();
}

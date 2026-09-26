import { GoogleSignin, type User } from '@react-native-google-signin/google-signin';

const DRIVE_APPDATA = 'https://www.googleapis.com/auth/drive.appdata';

export function configureGoogle(): void {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
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

type Tokens = { accessToken: string; idToken: string };

let inFlight: Promise<Tokens> | null = null;

/**
 * Access tokens expire after an hour; getTokens refreshes them. Callers asking at the same
 * moment share one request: the library rejects a second getTokens while one is running,
 * which on launch used to fail the group sign-in whenever Drive sync asked first.
 */
export function googleTokens(): Promise<Tokens> {
  inFlight ??= GoogleSignin.getTokens().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/** Withdraws the app's Drive and profile access, then signs out. */
export async function revokeGoogle(): Promise<void> {
  await GoogleSignin.revokeAccess();
  await GoogleSignin.signOut();
}

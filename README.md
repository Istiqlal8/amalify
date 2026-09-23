# Amalify — amal yaumi

A pink amal yaumi checklist. Each day's progress grows a plant, from seed to flowering tree. Friends in a group see each other's daily percentage.

## Where data lives

| Data | Stored in |
| --- | --- |
| Full checklist and history | The device (AsyncStorage), synced to the user's own Google Drive (`appDataFolder/amalify.json`, hidden and private to this app) |
| Groups, display name, today's percentage | Supabase (`supabase/schema.sql`). Which amalan were done, and haid days, never go to Supabase. |

Sync merges per day: the most recently edited day wins. The editable amalan list travels in the same file; the newer list wins.

## Setup

1. `cp .env.example .env` and fill it in.
2. **Google Cloud**: enable the Google Drive API. Create OAuth clients:
   - *Web application* → put its ID in `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`.
   - *Android* → package `com.amalify.app`, with the SHA-1 from `cd android && ./gradlew signingReport`.
   - *iOS* → bundle `com.amalify.app`; put its reversed client ID in `app.json` → `iosUrlScheme`.
   - OAuth consent screen: add the scope `.../auth/drive.appdata`.
3. **Supabase**: run `supabase/schema.sql` in the SQL editor. Under Auth → Providers → Google, enable it, add the Web client ID, and turn on *Skip nonce check* (needed for iOS).
   Put the project URL and anon key in `.env`. Without them the app runs and groups stay hidden.

## Run

```bash
npm install
ANDROID_HOME=$HOME/Library/Android/sdk npx expo run:android --port 8082   # first time, or after adding a native module
npx expo start --dev-client --port 8082                                   # afterwards
npm test && npm run typecheck
```

Expo Go does not work: Google Sign-In needs a development build.

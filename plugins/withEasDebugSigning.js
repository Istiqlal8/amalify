// Signs local debug builds with the EAS upload keystore when credentials.json is present (downloaded with
// `eas credentials`), so local and EAS builds share one SHA-1: one Google OAuth client, and a local APK can
// be installed over an EAS one. Without the file (EAS servers, other machines) the debug keystore is kept.
const { withAppBuildGradle } = require('expo/config-plugins');

const DEBUG_KEYSTORE = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`;

const EAS_OR_DEBUG = `        debug {
            def eas = rootProject.file('../credentials.json')
            if (eas.exists()) {
                def k = new groovy.json.JsonSlurper().parse(eas).android.keystore
                storeFile rootProject.file("../\${k.keystorePath}")
                storePassword k.keystorePassword
                keyAlias k.keyAlias
                keyPassword k.keyPassword
            } else {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
        }`;

module.exports = function withEasDebugSigning(config) {
  return withAppBuildGradle(config, (c) => {
    if (!c.modResults.contents.includes(DEBUG_KEYSTORE)) {
      throw new Error('withEasDebugSigning: debug signingConfig not found in app/build.gradle');
    }
    c.modResults.contents = c.modResults.contents.replace(DEBUG_KEYSTORE, EAS_OR_DEBUG);
    return c;
  });
};

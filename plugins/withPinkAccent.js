// Sets the Android theme's accent colour, which system dialogs (the time picker's buttons,
// text selection handles) fall back to. Without it they render in the platform's teal.
const { AndroidConfig, withAndroidColors, withAndroidStyles } = require('expo/config-plugins');

const NAME = 'colorAccent';

module.exports = function withPinkAccent(config, { color }) {
  config = withAndroidColors(config, (c) => {
    c.modResults = AndroidConfig.Colors.assignColorValue(c.modResults, { name: NAME, value: color });
    return c;
  });
  return withAndroidStyles(config, (c) => {
    c.modResults = AndroidConfig.Styles.assignStylesValue(c.modResults, {
      add: true,
      parent: AndroidConfig.Styles.getAppThemeGroup(),
      name: NAME,
      value: `@color/${NAME}`,
    });
    return c;
  });
};

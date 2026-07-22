// Dynamic config on top of app.json. When APP_VARIANT=development (set by the
// EAS development profile and the start:dev script), the app gets a separate
// identity so a dev build can be installed alongside the real app.

import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  name: IS_DEV ? 'Job Tracker Dev' : (config.name ?? 'Job Tracker'),
  android: {
    ...config.android,
    package: IS_DEV
      ? `${config.android?.package}.dev`
      : config.android?.package,
  },
});

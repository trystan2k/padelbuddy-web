import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.padelbuddy.web',
  appName: 'Padel Buddy',
  webDir: 'dist/client',
  android: {
    path: 'mobile/android',
    backgroundColor: '#F4F0E7'
  },
  ios: {
    path: 'mobile/ios',
    backgroundColor: '#F4F0E7'
  }
};

export default config;

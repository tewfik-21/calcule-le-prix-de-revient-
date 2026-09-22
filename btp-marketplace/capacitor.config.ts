import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.btp.marketplace',
  appName: 'BTP Market DZ',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#0f172a',
      launchShowDuration: 3000,
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
    }
  }
};

export default config;

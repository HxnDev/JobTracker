declare namespace NodeJS {
  interface ProcessEnv {
    /** Set to "development" for the side-by-side dev variant (see app.config.ts). */
    APP_VARIANT?: string;
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?: string;
    EXPO_PUBLIC_SPREADSHEET_ID?: string;
    EXPO_PUBLIC_SHEET_NAME?: string;
  }
}

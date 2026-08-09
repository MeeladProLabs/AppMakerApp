/**
 * App Maker - Configuration Settings
 * Holds global paths, settings, and storage key identifiers.
 */

const APP_CONFIG = {
  appName: "App Maker",
  version: "1.0.0",
  
  // File pathways within the GitHub repository
  paths: {
    indexRegistry: "./data/index.json",
    usersFolder: "./data/users/",
    appsFolder: "./data/apps/"
  },

  // Fallback counter defaults
  defaults: {
    startUid: 1,
    startAid: 1
  },

  // Browser LocalStorage keys for active user sessions
  storageKeys: {
    userSession: "appmaker_user_session",
    activeApp: "appmaker_active_app"
  }
};

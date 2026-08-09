/**
 * App Maker - Configuration Settings
 * Holds global paths, settings, and storage key identifiers.
 */

const APP_CONFIG = {
  appName: "App Maker App",
  version: "1.0.0",

  // Repository defaults (Can be overridden in UI settings)
  github: {
    defaultOwner: "", // Your GitHub username (e.g. "meeladprolabs")
    defaultRepo: "",  // Your Repository name (e.g. "AppMakerApp")
    defaultBranch: "main"
  },

  // File pathways within the GitHub repository
  paths: {
    indexRegistry: "data/index.json",
    usersFolder: "data/users/",
    appsFolder: "data/apps/"
  },

  // Counter defaults
  defaults: {
    startUid: 1,
    startAid: 1
  },

  // LocalStorage keys
  storageKeys: {
    userSession: "appmaker_user_session",
    githubToken: "appmaker_github_pat",
    githubOwner: "appmaker_github_owner",
    githubRepo: "appmaker_github_repo"
  }
};

/**
 * App Maker - Configuration Settings
 * Holds global paths, settings, and embedded GitHub authorization token.
 */

const APP_CONFIG = {
  appName: "App Maker",
  version: "1.0.0",

  github: {
    defaultOwner: "MeeladProLabs",
    defaultRepo: "AppMakerApp",
    defaultBranch: "main",
    // Embed your Personal Access Token directly here
    token: "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"
  },

  paths: {
    indexRegistry: "data/index.json",
    usersFolder: "data/users/",
    appsFolder: "data/apps/"
  },

  defaults: {
    startUid: 1,
    startAid: 1
  },

  storageKeys: {
    userSession: "appmaker_user_session",
    githubToken: "appmaker_github_pat",
    githubOwner: "appmaker_github_owner",
    githubRepo: "appmaker_github_repo"
  }
};

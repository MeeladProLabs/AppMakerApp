/**
 * App Maker - Data Manager
 * Handles URL parameter parsing, reading registry data, and managing app states.
 */

const DataManager = {
  /**
   * Reads URL parameters like ?uid=1&aid=1 from the web browser address bar.
   * @returns {{uid: string|null, aid: string|null}}
   */
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      uid: params.get('uid'),
      aid: params.get('aid')
    };
  },

  /**
   * Updates the browser URL bar without reloading the page.
   * @param {number|string} uid - User ID
   * @param {number|string} aid - App ID
   */
  updateUrlParams(uid, aid) {
    const url = new URL(window.location);
    if (uid !== null && uid !== undefined) {
      url.searchParams.set('uid', uid);
    }
    if (aid !== null && aid !== undefined) {
      url.searchParams.set('aid', aid);
    }
    window.history.pushState({}, '', url);
  },

  /**
   * Fetches the central index file (data/index.json).
   * @returns {Promise<Object>}
   */
  async loadIndexRegistry() {
    try {
      const response = await fetch(APP_CONFIG.paths.indexRegistry);
      if (!response.ok) {
        throw new Error('Failed to load registry index.');
      }
      return await response.json();
    } catch (error) {
      console.error('Error loading index registry:', error);
      return {
        counters: { next_uid: APP_CONFIG.defaults.startUid, next_aid: APP_CONFIG.defaults.startAid },
        user_app_index: []
      };
    }
  },

  /**
   * Creates a new default user object ready for saving.
   * @param {number} uid 
   * @param {string} secretKey 
   * @returns {Object}
   */
  createNewUserProfile(uid, secretKey) {
    return {
      uid: uid,
      secretKey: secretKey,
      createdAt: new Date().toISOString(),
      createdApps: []
    };
  },

  /**
   * Creates a new default app object ready for saving.
   * @param {number} aid 
   * @param {number} uid 
   * @param {string} name 
   * @param {string} category 
   * @param {string} description 
   * @returns {Object}
   */
  createNewAppObject(aid, uid, name, category, description) {
    return {
      aid: aid,
      uid: uid,
      appName: name,
      category: category,
      description: description,
      createdAt: new Date().toISOString(),
      aotObjects: [],
      canvasLayout: []
    };
  }
};

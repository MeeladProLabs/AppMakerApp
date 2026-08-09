/**
 * App Maker - Data Manager
 * Direct GitHub REST API Integration (Contents API GET/PUT operations).
 */

const DataManager = {
  /**
   * Encodes a string to Base64 (UTF-8 safe)
   */
  utf8ToBase64(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * Decodes a Base64 string to UTF-8 text
   */
  base64ToUtf8(str) {
    const cleanStr = str.replace(/\n/g, '').replace(/\r/g, '');
    const binary = atob(cleanStr);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  },

  /**
   * Reads URL parameters (?uid=X&aid=Y) from address bar
   */
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      uid: params.get('uid'),
      aid: params.get('aid')
    };
  },

  /**
   * Updates address bar parameters without page reload
   */
  updateUrlParams(uid, aid) {
    const url = new URL(window.location);
    if (uid !== null && uid !== undefined) {
      url.searchParams.set('uid', uid);
    } else {
      url.searchParams.delete('uid');
    }

    if (aid !== null && aid !== undefined) {
      url.searchParams.set('aid', aid);
    } else {
      url.searchParams.delete('aid');
    }

    window.history.pushState({}, '', url);
  },

  /**
   * Retrieves GitHub API Credentials automatically from APP_CONFIG or LocalStorage
   */
  getGitHubCredentials() {
    return {
      token: APP_CONFIG.github.token || localStorage.getItem(APP_CONFIG.storageKeys.githubToken) || '',
      owner: localStorage.getItem(APP_CONFIG.storageKeys.githubOwner) || APP_CONFIG.github.defaultOwner,
      repo: localStorage.getItem(APP_CONFIG.storageKeys.githubRepo) || APP_CONFIG.github.defaultRepo
    };
  },

  /**
   * Performs GET request to fetch file content and current SHA hash from GitHub
   */
  async getGitHubFile(filePath) {
    const { token, owner, repo } = this.getGitHubCredentials();
    const cleanPath = filePath.replace(/^\/+/, '');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${url}?t=${Date.now()}`, { headers });
      if (response.status === 404) {
        return { exists: false, sha: null, data: null };
      }
      if (!response.ok) {
        throw new Error(`GitHub GET failed (${response.status})`);
      }

      const jsonResponse = await response.json();
      const decodedText = this.base64ToUtf8(jsonResponse.content);
      const parsedData = JSON.parse(decodedText);

      return {
        exists: true,
        sha: jsonResponse.sha,
        data: parsedData
      };
    } catch (error) {
      console.warn(`Could not fetch ${cleanPath} from GitHub API:`, error);
      return { exists: false, sha: null, data: null };
    }
  },

  /**
   * Performs GET for SHA, encodes payload to Base64, and sends PUT request to commit changes
   */
  async commitGitHubFile(filePath, contentObject, commitMessage) {
    const { token, owner, repo } = this.getGitHubCredentials();

    if (!token || !owner || !repo) {
      console.warn('GitHub PAT or Repository info missing. Changes saved to LocalStorage only.');
      return false;
    }

    const cleanPath = filePath.replace(/^\/+/, '');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${cleanPath}`;

    // 1. GET current file to grab current SHA hash
    const currentFile = await this.getGitHubFile(cleanPath);

    // 2. Convert JSON object to formatted string, then to Base64
    const jsonString = JSON.stringify(contentObject, null, 2);
    const contentBase64 = this.utf8ToBase64(jsonString);

    // 3. Prepare PUT request payload
    const putBody = {
      message: commitMessage,
      content: contentBase64,
      branch: APP_CONFIG.github.defaultBranch
    };

    if (currentFile.sha) {
      putBody.sha = currentFile.sha;
    }

    // 4. Send PUT Request
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(putBody)
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.message || `GitHub PUT failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log(`Successfully committed ${cleanPath} to GitHub!`, result);
      return true;
    } catch (error) {
      console.error('GitHub Commit Error:', error);
      alert(`GitHub Commit Error: ${error.message}`);
      return false;
    }
  },

  /**
   * Loads central registry index (data/index.json) via GitHub API or static fallback
   */
  async loadIndexRegistry() {
    const result = await this.getGitHubFile(APP_CONFIG.paths.indexRegistry);
    if (result.exists && result.data) {
      return result.data;
    }

    try {
      const fallbackResponse = await fetch(`${APP_CONFIG.paths.indexRegistry}?t=${Date.now()}`);
      if (fallbackResponse.ok) {
        return await fallbackResponse.json();
      }
    } catch (e) {
      console.warn('Fallback index registry fetch failed:', e);
    }

    return {
      counters: { next_uid: APP_CONFIG.defaults.startUid, next_aid: APP_CONFIG.defaults.startAid },
      user_app_index: []
    };
  },

  /**
   * Helper object to build standard User data structure
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
   * Helper object to build standard App data structure
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

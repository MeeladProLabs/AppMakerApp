/**
 * App Maker - Data Manager
 * Handles URL parameter parsing, LocalStorage caching, and GitHub REST API file commits.
 */

const DataManager = {
  // Reads ?uid=X&aid=Y from browser address bar
  getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      uid: params.get('uid'),
      aid: params.get('aid')
    };
  },

  // Updates address bar parameters without page reload
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

  // Reads the central registry index
  async loadIndexRegistry() {
    try {
      const response = await fetch(`${APP_CONFIG.paths.indexRegistry}?t=${Date.now()}`);
      if (!response.ok) throw new Error('Registry file not found.');
      return await response.json();
    } catch (error) {
      console.warn('Using local fallback index registry:', error);
      return {
        counters: { next_uid: 1, next_aid: 1 },
        user_app_index: []
      };
    }
  },

  // Saves or commits a file directly to GitHub Repository via GitHub API
  async commitFileToGitHub(filePath, contentObject, commitMessage, githubToken, repoOwner, repoName) {
    if (!githubToken) {
      console.warn('No GitHub Token provided. Data saved to browser LocalStorage only.');
      return false;
    }

    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const jsonString = JSON.stringify(contentObject, null, 2);
    
    // Convert content to base64 encoding required by GitHub API
    const contentBase64 = btoa(unescape(encodeURIComponent(jsonString)));

    try {
      // 1. Check if file already exists to get its SHA hash
      let sha = null;
      const getResponse = await fetch(apiUrl, {
        headers: { 'Authorization': `token ${githubToken}` }
      });
      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }

      // 2. Commit file to GitHub repository
      const putResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: contentBase64,
          sha: sha || undefined
        })
      });

      if (!putResponse.ok) {
        const errData = await putResponse.json();
        throw new Error(errData.message || 'Failed to commit to GitHub.');
      }

      console.log(`Successfully saved ${filePath} to GitHub repo!`);
      return true;
    } catch (error) {
      console.error('GitHub API Commit Error:', error);
      return false;
    }
  },

  // Helper object to generate standard User data structure
  createNewUserProfile(uid, secretKey) {
    return {
      uid: uid,
      secretKey: secretKey,
      createdAt: new Date().toISOString(),
      createdApps: []
    };
  },

  // Helper object to generate standard App data structure
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

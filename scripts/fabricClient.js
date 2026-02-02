// Microsoft Fabric Client - Direct API Integration
// No backend server needed - runs entirely in browser

class FabricClient {
  constructor() {
    this.config = {
      // ✅ Your actual Fabric workspace configuration
      workspaceId: 'aa2e4642-108a-4ce5-a99f-9ad4c87856bc',
      workspaceName: 'MS-Fabric-Learn',
      lakehouseId: '9a01978a-106f-42bd-b114-913e4f7c29c2',
      lakehouseName: 'Learning_LH',
      dataPath: 'Files/TrainingData/',
      
      // OneLake direct URLs (public read access)
      oneLakeBaseUrl: 'https://onelake.dfs.fabric.microsoft.com/MS-Fabric-Learn/Learning_LH.Lakehouse/Files/TrainingData',
      
      // For Azure AD auth (optional - if you want to add write permissions)
      tenantId: 'YOUR_TENANT_ID', // Get from portal.azure.com
      clientId: 'YOUR_CLIENT_ID', // Register app in Azure AD
      redirectUri: window.location.origin
    };
    
    this.token = null;
    this.msalInstance = null;
    
    // Initialize MSAL only if credentials provided
    if (this.config.tenantId !== 'YOUR_TENANT_ID') {
      this.initMSAL();
    }
  }

  // Initialize Microsoft Authentication Library
  initMSAL() {
    const msalConfig = {
      auth: {
        clientId: this.config.clientId,
        authority: `https://login.microsoftonline.com/${this.config.tenantId}`,
        redirectUri: this.config.redirectUri
      },
      cache: {
        cacheLocation: 'localStorage',
        storeAuthStateInCookie: false
      }
    };

    this.msalInstance = new msal.PublicClientApplication(msalConfig);
  }

  // Authenticate with Azure AD
  async authenticate() {
    const loginRequest = {
      scopes: ['https://api.fabric.microsoft.com/.default']
    };

    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      this.token = response.accessToken;
      return response;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw error;
    }
  }

  // Get access token
  async getToken() {
    if (this.token) return this.token;

    const accounts = this.msalInstance.getAllAccounts();
    if (accounts.length === 0) {
      await this.authenticate();
    }

    const silentRequest = {
      scopes: ['https://api.fabric.microsoft.com/.default'],
      account: accounts[0]
    };

    try {
      const response = await this.msalInstance.acquireTokenSilent(silentRequest);
      this.token = response.accessToken;
      return this.token;
    } catch (error) {
      // Fallback to popup
      const response = await this.msalInstance.acquireTokenPopup(silentRequest);
      this.token = response.accessToken;
      return this.token;
    }
  }

  // Execute SQL query on Fabric Lakehouse
  async executeQuery(query, parameters = []) {
    const token = await this.getToken();
    const sqlEndpoint = `${this.baseUrl}/workspaces/${this.config.workspaceId}/lakehouses/${this.config.lakehouseId}/query`;

    const response = await fetch(sqlEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: query,
        parameters: parameters
      })
    });

    if (!response.ok) {
      throw new Error(`Query failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // ========== TRAINING DAYS OPERATIONS ==========

  async getAllTrainingDays() {
    try {
      // Read directly from OneLake JSON file
      const url = `${this.config.oneLakeBaseUrl}/training_days.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Using fallback data - OneLake file not accessible');
        return this.getFallbackTrainingDays();
      }
      
      const days = await response.json();
      
      // Fetch recordings for each day
      const recordings = await this.getAllRecordings();
      days.forEach(day => {
        day.recording = recordings.find(r => r.dayNumber === day.dayNumber) || null;
      });
      
      return days;
    } catch (error) {
      console.error('Error loading training days:', error);
      return this.getFallbackTrainingDays();
    }
  }

  async getTrainingDay(dayNumber) {
    const query = `
      SELECT * FROM training_days 
      WHERallDays = await this.getAllTrainingDays();
    return allDays.find(day => day.dayNumber === dayNumber) || null;
  }

  async getAllRecordings() {
    try {
      const url = `${this.config.oneLakeBaseUrl}/recordings.json`;
      const response = await fetch(url);
      
      if (!response.ok) return [];
      
      return await response.json();
    } catch (error) {
      console.error('Error loading recordings:', error);
      return [];
    try {
      // Read current data
      const days = await this.getAllTrainingDays();
      const day = days.find(d => d.dayNumber === dayNumber);
      
      if (!day) throw new Error('Day not found');
      
      // Update the day
      day.isUnlocked = true;
      day.unlockedAt = new Date().toISOString();
      day.unlockedBy = adminEmail;
      
      // Write back to OneLake (requires authentication)
      await this.saveTrainingDays(days);
      
    try {
      const days = await this.getAllTrainingDays();
      const day = days.find(d => d.dayNumber === dayNumber);
      
      if (!day) throw new Error('Day not found');
      
      day.isUnlocked = false;
      day.unlockedAt = null;
      day.unlockedBy = null;
      
      await this.saveTrainingDays(days);
      
      return day;
    } catch (error) {
      console.error('Error locking day:', error);
      throw error;
    }
  }

  async saveTrainingDays(days) {
    // This requires write access - needs authentication
    const token = await this.getToken();
    const url = `${this.config.oneLakeBaseUrl}/training_days.json`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    try {
      const recordingId = this.generateUUID();
      const embedUrl = this.generateEmbedUrl(recording.videoUrl);
      
      const recordings = await this.getAllRecordings();
      
      const newRecording = {
        recordingId,
        dayNumber: recording.dayNumber,
        title: recording.title,
        videoUrl: recording.videoUrl,
        embedUrl,
        platform: recording.platform,
        duration: recording.duration,
        uploadedAt: new Date().toISOString(),
        uploadedBy: recording.uploadedBy,
        viewCount: 0,
        isActive: true
      };
      
      // Remove old recording for this day if exists
      const filtered = recordings.filter(r => r.dayNumber !== recording.dayNumber);
      filtered.push(newRecording);
      
      await this.saveRecordings(filtered);
      
      return newRecording;
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  }

  async saveRecordings(recordings) {
    const token = await this.getToken();
    const url = `${this.config.oneLakeBaseUrl}/recordings.json`;
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-ms-version': '2023-11-03'
      },
      body: JSON.stringify(recordings, null, 2)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save recordings: ${response.statusText}`);
    }
    const query = `
      SELECT * FROM recordings 
      WHERE day_number = ? AND is_active = 1
      ORDER BY uploaded_at DESC
      LIMIT 1
    `;
    
    const result = await this.executeQuery(query, [dayNumber]);
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async uploadRecording(recording) {
    const recordingId = this.generateUUID();
    const embedUrl = this.generateEmbedUrl(recording.videoUrl);
    try {
      const days = await this.getAllTrainingDays();
      const recordings = await this.getAllRecordings();
      
      const unlockedCount = days.filter(d => d.isUnlocked).length;
      const activeRecordings = recordings.filter(r => r.isActive).length;
      
      return {
        totalDays: 12,
        unlockedDays: unlockedCount,
        lockedDays: 12 - unlockedCount,
        recordingsAvailable: activeRecordings,
        totalUsers: 1, // Admin only for now
        activeStudents: 0
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDays: 12,
        unlockedDays: 0,
        lockedDays: 12,
        recordingsAvailable: 0,
        totalUsers: 0,
        activeStudents: 0
      };
    }
  }

  // Fallback data when OneLake is not accessible
  getFallbackTrainingDays() {
    const days = [];
    const titles = [
      'Introduction to Power BI & Data Connectivity',
      'Power Query & Data Transformation',
      'Data Modeling & Relationships',
      'Introduction to DAX',
      'Essential DAX Functions Part 1',
      'Essential DAX Functions Part 2',
      'Advanced DAX Patterns',
      'Time Intelligence & Date Functions',
      'Power BI Visualizations',
      'Advanced Analytics & AI Features',
      'Power BI Service & Collaboration',
      'Performance Optimization & Best Practices'
    ];
    
    for (let i = 1; i <= 12; i++) {
      const dayNum = String(i).padStart(2, '0');
      days.push({
        dayNumber: i,
        title: titles[i-1],
        description: '',
        isUnlocked: false,
        unlockedAt: null,
        unlockedBy: null,
        presentationUrl: `presentations/Day_${dayNum}_Presentation.html`,
        resourcesUrl: null,
        recording: null
      });
    }
    
    return daysnc getRecording(recordingId) {
    const query = `SELECT * FROM recordings WHERE recording_id = ?`;
    const result = await this.executeQuery(query, [recordingId]);
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async removeRecording(recordingId) {
    const query = `
      UPDATE recordings 
      SET is_active = 0 
      WHERE recording_id = ?
    `;
    
    await this.executeQuery(query, [recordingId]);
    return true;
  }

  // ========== USER OPERATIONS ==========

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const result = await this.executeQuery(query, [email]);
    return result.rows && result.rows.length > 0 ? result.rows[0] : null;
  }

  async createUser(email, role = 'STUDENT') {
    const userId = this.generateUUID();
    const query = `
      INSERT INTO users (user_id, email, role, created_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    
    await this.executeQuery(query, [userId, email, role]);
    return await this.getUserByEmail(email);
  }

  // ========== DASHBOARD STATS ==========

  async getDashboardStats() {
    const queries = {
      totalDays: `SELECT COUNT(*) as count FROM training_days`,
      unlockedDays: `SELECT COUNT(*) as count FROM training_days WHERE is_unlocked = 1`,
      recordings: `SELECT COUNT(*) as count FROM recordings WHERE is_active = 1`,
      users: `SELECT COUNT(*) as count FROM users`,
      activeStudents: `SELECT COUNT(DISTINCT user_id) as count FROM user_progress WHERE last_accessed >= DATE_SUB(CURRENT_DATE, INTERVAL 7 DAY)`
    };

    const results = await Promise.all([
      this.executeQuery(queries.totalDays),
      this.executeQuery(queries.unlockedDays),
      this.executeQuery(queries.recordings),
      this.executeQuery(queries.users),
      this.executeQuery(queries.activeStudents)
    ]);

    return {
      totalDays: results[0].rows[0].count,
      unlockedDays: results[1].rows[0].count,
      lockedDays: results[0].rows[0].count - results[1].rows[0].count,
      recordingsAvailable: results[2].rows[0].count,
      totalUsers: results[3].rows[0].count,
      activeStudents: results[4].rows[0].count
    };
  }

  // ========== HELPER FUNCTIONS ==========

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  generateEmbedUrl(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1].split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  }

  // Initialize database tables (run once)
  async initializeTables() {
    const tables = [
      // Training Days
      `CREATE TABLE IF NOT EXISTS training_days (
        day_number INT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        is_unlocked BOOLEAN DEFAULT FALSE,
        unlocked_at TIMESTAMP,
        unlocked_by VARCHAR(255),
        presentation_url VARCHAR(500),
        resources_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      // Recordings
      `CREATE TABLE IF NOT EXISTS recordings (
        recording_id VARCHAR(36) PRIMARY KEY,
        day_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        video_url VARCHAR(500) NOT NULL,
        embed_url VARCHAR(500),
        platform VARCHAR(50),
        duration VARCHAR(50),
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        uploaded_by VARCHAR(255),
        view_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (day_number) REFERENCES training_days(day_number)
      )`,

      // Users
      `CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'STUDENT',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )`,

      // User Progress
      `CREATE TABLE IF NOT EXISTS user_progress (
        progress_id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        day_number INT NOT NULL,
        viewed_presentation BOOLEAN DEFAULT FALSE,
        viewed_recording BOOLEAN DEFAULT FALSE,
        completion_percentage FLOAT DEFAULT 0,
        last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (day_number) REFERENCES training_days(day_number)
      )`,

      // Admin Actions Log
      `CREATE TABLE IF NOT EXISTS admin_actions (
        action_id VARCHAR(36) PRIMARY KEY,
        admin_id VARCHAR(36) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        day_number INT,
        metadata TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(user_id)
      )`
    ];

    for (const query of tables) {
      await this.executeQuery(query);
    }

    // Insert initial training days data
    await this.seedInitialData();
  }

  async seedInitialData() {
    const days = [
      { day: 1, title: 'Introduction to Power BI & Data Connectivity', desc: 'Getting started with Power BI Desktop' },
      { day: 2, title: 'Power Query & Data Transformation', desc: 'Master data transformation' },
      { day: 3, title: 'Data Modeling & Relationships', desc: 'Build efficient data models' },
      { day: 4, title: 'Introduction to DAX', desc: 'Learn DAX fundamentals' },
      { day: 5, title: 'Essential DAX Functions Part 1', desc: 'Key DAX functions' },
      { day: 6, title: 'Essential DAX Functions Part 2', desc: 'Advanced functions' },
      { day: 7, title: 'Advanced DAX Patterns', desc: 'Complex calculations' },
      { day: 8, title: 'Time Intelligence & Date Functions', desc: 'Time-based analysis' },
      { day: 9, title: 'Power BI Visualizations', desc: 'Create stunning visuals' },
      { day: 10, title: 'Advanced Analytics & AI Features', desc: 'AI-powered insights' },
      { day: 11, title: 'Power BI Service & Collaboration', desc: 'Share and collaborate' },
      { day: 12, title: 'Performance Optimization & Best Practices', desc: 'Optimize your reports' }
    ];

    for (const day of days) {
      const dayNum = String(day.day).padStart(2, '0');
      const query = `
        INSERT INTO training_days (day_number, title, description, presentation_url)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE title = title
      `;
      
      await this.executeQuery(query, [
        day.day,
        day.title,
        day.desc,
        `presentations/Day_${dayNum}_Presentation.html`
      ]);
    }
  }
}

// Export for use in HTML files
window.FabricClient = FabricClient;

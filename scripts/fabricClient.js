/**
 * Microsoft Fabric OneLake Client
 * Handles direct browser-to-Fabric API calls for training portal data
 */

class FabricClient {
  constructor() {
    this.config = {
      workspaceId: 'aa2e4642-108a-4ce5-a99f-9ad4c87856bc',
      lakehouseId: '9a01978a-106f-42bd-b114-913e4f7c29c2',
      workspaceName: 'MS-Fabric-Learn',
      lakehouseName: 'Learning_LH',
      oneLakeBaseUrl: 'https://onelake.dfs.fabric.microsoft.com/MS-Fabric-Learn/Learning_LH.Lakehouse/Files/TrainingData'
    };
    
    this.msalConfig = {
      auth: {
        clientId: 'YOUR_CLIENT_ID',
        authority: 'https://login.microsoftonline.com/common',
        redirectUri: window.location.origin
      }
    };
    
    this.msalInstance = null;
  }

  async getToken() {
    // For read operations, no token needed (public read access)
    // For write operations, would need MSAL authentication
    return null;
  }

  async getAllTrainingDays() {
    try {
      const url = `${this.config.oneLakeBaseUrl}/training_days.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        console.warn('Failed to load from Fabric, using fallback');
        return this.getFallbackTrainingDays();
      }
      
      const days = await response.json();
      console.log('✅ Loaded training days from Microsoft Fabric');
      return days;
    } catch (error) {
      console.error('Error loading training days:', error);
      return this.getFallbackTrainingDays();
    }
  }

  async getTrainingDay(dayNumber) {
    const allDays = await this.getAllTrainingDays();
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
    }
  }

  async unlockDay(dayNumber, unlockedBy = 'admin') {
    try {
      const days = await this.getAllTrainingDays();
      const day = days.find(d => d.dayNumber === dayNumber);
      
      if (!day) throw new Error(`Day ${dayNumber} not found`);
      
      day.isUnlocked = true;
      day.unlockedAt = new Date().toISOString();
      day.unlockedBy = unlockedBy;
      
      await this.saveTrainingDays(days);
      
      return day;
    } catch (error) {
      console.error('Error unlocking day:', error);
      throw error;
    }
  }

  async lockDay(dayNumber) {
    try {
      const days = await this.getAllTrainingDays();
      const day = days.find(d => d.dayNumber === dayNumber);
      
      if (!day) throw new Error(`Day ${dayNumber} not found`);
      
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
    const token = await this.getToken();
    const url = `${this.config.oneLakeBaseUrl}/training_days.json`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-ms-version': '2023-11-03'
        },
        body: JSON.stringify(days, null, 2)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save training days: ${response.statusText}`);
      }
      
      console.log('✅ Saved training days to Fabric');
    } catch (error) {
      console.error('Error saving training days:', error);
      throw error;
    }
  }

  async uploadRecording(recording) {
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
    
    try {
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
      
      console.log('✅ Saved recordings to Fabric');
    } catch (error) {
      console.error('Error saving recordings:', error);
      throw error;
    }
  }

  async removeRecording(recordingId) {
    try {
      const recordings = await this.getAllRecordings();
      const filtered = recordings.filter(r => r.recordingId !== recordingId);
      
      await this.saveRecordings(filtered);
      
      console.log('✅ Recording removed from Fabric');
    } catch (error) {
      console.error('Error removing recording:', error);
      throw error;
    }
  }

  async getDashboardStats() {
    try {
      const days = await this.getAllTrainingDays();
      const recordings = await this.getAllRecordings();
      
      return {
        totalDays: days.length,
        unlockedDays: days.filter(d => d.isUnlocked).length,
        lockedDays: days.filter(d => !d.isUnlocked).length,
        recordingsAvailable: recordings.length
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      return {
        totalDays: 12,
        unlockedDays: 0,
        lockedDays: 12,
        recordingsAvailable: 0
      };
    }
  }

  generateEmbedUrl(url) {
    if (url.includes('youtube.com/watch')) {
      const videoId = new URL(url).searchParams.get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    if (url.includes('drive.google.com')) {
      const fileId = url.match(/\/d\/([^/]+)/)?.[1] || url.match(/id=([^&]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    }
    return url;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  getFallbackTrainingDays() {
    return [
      { dayNumber: 1, title: 'Introduction to Power BI & Data Connectivity', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 2, title: 'Power Query & Data Transformation', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 3, title: 'Data Modeling & Relationships', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 4, title: 'Introduction to DAX', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 5, title: 'Essential DAX Functions Part 1', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 6, title: 'Essential DAX Functions Part 2', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 7, title: 'Advanced DAX Patterns', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 8, title: 'Time Intelligence & Date Functions', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 9, title: 'Power BI Visualizations', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 10, title: 'Advanced Analytics & AI Features', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 11, title: 'Power BI Service & Collaboration', isUnlocked: false, unlockedAt: null, unlockedBy: null },
      { dayNumber: 12, title: 'Performance Optimization & Best Practices', isUnlocked: false, unlockedAt: null, unlockedBy: null }
    ];
  }
}

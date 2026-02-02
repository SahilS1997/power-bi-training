"""
Power BI Training Admin Script
Manages content (unlock/lock days, upload recordings) with Fabric backend
Uses Service Principal authentication
"""

import os
import json
import requests
from datetime import datetime
from typing import Dict, List, Optional
from azure.identity import ClientSecretCredential, DefaultAzureCredential
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FabricAdminClient:
    """Admin client for managing training content in Microsoft Fabric"""
    
    def __init__(self):
        """Initialize with Service Principal or Default credentials"""
        self.workspace_id = os.getenv('FABRIC_WORKSPACE_ID', 'aa2e4642-108a-4ce5-a99f-9ad4c87856bc')
        self.lakehouse_id = os.getenv('FABRIC_LAKEHOUSE_ID', '9a01978a-106f-42bd-b114-913e4f7c29c2')
        self.workspace_name = 'MS-Fabric-Learn'
        self.lakehouse_name = 'Learning_LH'
        
        # OneLake REST API base URL
        self.onelake_base = f"https://onelake.dfs.fabric.microsoft.com/{self.workspace_name}/{self.lakehouse_name}.Lakehouse/Files/TrainingData"
        
        # Initialize authentication
        self._setup_auth()
        
    def _setup_auth(self):
        """Setup Azure authentication"""
        try:
            # Try Service Principal first (for GitHub Actions)
            if all([os.getenv('AZURE_CLIENT_ID'), 
                   os.getenv('AZURE_TENANT_ID'), 
                   os.getenv('AZURE_CLIENT_SECRET')]):
                print("🔐 Using Service Principal authentication")
                self.credential = ClientSecretCredential(
                    tenant_id=os.getenv('AZURE_TENANT_ID'),
                    client_id=os.getenv('AZURE_CLIENT_ID'),
                    client_secret=os.getenv('AZURE_CLIENT_SECRET')
                )
            else:
                # Fallback to default (Azure CLI, Managed Identity, etc.)
                print("🔐 Using Default Azure credentials")
                self.credential = DefaultAzureCredential()
            
            # Get initial token to verify auth
            self._get_token()
            print("✅ Authentication successful")
            
        except Exception as e:
            print(f"❌ Authentication failed: {e}")
            raise
    
    def _get_token(self) -> str:
        """Get access token for Fabric API"""
        scope = "https://storage.azure.com/.default"
        token = self.credential.get_token(scope)
        return token.token
    
    def _make_request(self, method: str, url: str, **kwargs) -> requests.Response:
        """Make authenticated request to OneLake API"""
        token = self._get_token()
        headers = kwargs.pop('headers', {})
        headers.update({
            'Authorization': f'Bearer {token}',
            'x-ms-version': '2023-11-03'
        })
        
        response = requests.request(method, url, headers=headers, **kwargs)
        return response
    
    # ========== Training Days Operations ==========
    
    def get_all_days(self) -> List[Dict]:
        """Get all training days from Fabric"""
        try:
            url = f"{self.onelake_base}/training_days.json"
            response = self._make_request('GET', url)
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"⚠️ Failed to load days: {response.status_code}")
                return self._get_default_days()
        except Exception as e:
            print(f"❌ Error loading days: {e}")
            return self._get_default_days()
    
    def unlock_day(self, day_number: int, unlocked_by: str = 'admin') -> bool:
        """Unlock a training day"""
        try:
            days = self.get_all_days()
            
            for day in days:
                if day['dayNumber'] == day_number:
                    day['isUnlocked'] = True
                    day['unlockedAt'] = datetime.utcnow().isoformat() + 'Z'
                    day['unlockedBy'] = unlocked_by
                    break
            
            success = self._save_days(days)
            if success:
                print(f"✅ Day {day_number} unlocked successfully")
            return success
            
        except Exception as e:
            print(f"❌ Error unlocking day {day_number}: {e}")
            return False
    
    def lock_day(self, day_number: int) -> bool:
        """Lock a training day"""
        try:
            days = self.get_all_days()
            
            for day in days:
                if day['dayNumber'] == day_number:
                    day['isUnlocked'] = False
                    day['unlockedAt'] = None
                    day['unlockedBy'] = None
                    break
            
            success = self._save_days(days)
            if success:
                print(f"🔒 Day {day_number} locked successfully")
            return success
            
        except Exception as e:
            print(f"❌ Error locking day {day_number}: {e}")
            return False
    
    def unlock_all_days(self, unlocked_by: str = 'admin') -> bool:
        """Unlock all training days"""
        try:
            days = self.get_all_days()
            timestamp = datetime.utcnow().isoformat() + 'Z'
            
            for day in days:
                day['isUnlocked'] = True
                day['unlockedAt'] = timestamp
                day['unlockedBy'] = unlocked_by
            
            success = self._save_days(days)
            if success:
                print(f"✅ All {len(days)} days unlocked successfully")
            return success
            
        except Exception as e:
            print(f"❌ Error unlocking all days: {e}")
            return False
    
    def _save_days(self, days: List[Dict]) -> bool:
        """Save training days to Fabric"""
        try:
            url = f"{self.onelake_base}/training_days.json"
            content = json.dumps(days, indent=2)
            
            response = self._make_request(
                'PUT',
                url,
                headers={'Content-Type': 'application/json'},
                data=content
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            print(f"❌ Error saving days: {e}")
            return False
    
    # ========== Recording Operations ==========
    
    def get_all_recordings(self) -> List[Dict]:
        """Get all recordings from Fabric"""
        try:
            url = f"{self.onelake_base}/recordings.json"
            response = self._make_request('GET', url)
            
            if response.status_code == 200:
                return response.json()
            else:
                return []
        except Exception as e:
            print(f"❌ Error loading recordings: {e}")
            return []
    
    def upload_recording(self, day_number: int, title: str, video_url: str, 
                        duration: str, platform: str = 'YOUTUBE',
                        uploaded_by: str = 'admin') -> bool:
        """Upload a session recording"""
        try:
            recordings = self.get_all_recordings()
            
            # Remove old recording for this day
            recordings = [r for r in recordings if r['dayNumber'] != day_number]
            
            # Create new recording
            new_recording = {
                'recordingId': self._generate_uuid(),
                'dayNumber': day_number,
                'title': title,
                'videoUrl': video_url,
                'embedUrl': self._generate_embed_url(video_url),
                'platform': platform,
                'duration': duration,
                'uploadedAt': datetime.utcnow().isoformat() + 'Z',
                'uploadedBy': uploaded_by,
                'viewCount': 0,
                'isActive': True
            }
            
            recordings.append(new_recording)
            
            success = self._save_recordings(recordings)
            if success:
                print(f"✅ Recording uploaded for Day {day_number}")
            return success
            
        except Exception as e:
            print(f"❌ Error uploading recording: {e}")
            return False
    
    def remove_recording(self, day_number: int) -> bool:
        """Remove recording for a specific day"""
        try:
            recordings = self.get_all_recordings()
            
            # Remove recording for this day
            recordings = [r for r in recordings if r['dayNumber'] != day_number]
            
            success = self._save_recordings(recordings)
            if success:
                print(f"🗑️ Recording removed for Day {day_number}")
            return success
            
        except Exception as e:
            print(f"❌ Error removing recording: {e}")
            return False
    
    def _save_recordings(self, recordings: List[Dict]) -> bool:
        """Save recordings to Fabric"""
        try:
            url = f"{self.onelake_base}/recordings.json"
            content = json.dumps(recordings, indent=2)
            
            response = self._make_request(
                'PUT',
                url,
                headers={'Content-Type': 'application/json'},
                data=content
            )
            
            return response.status_code in [200, 201]
            
        except Exception as e:
            print(f"❌ Error saving recordings: {e}")
            return False
    
    # ========== Stats & Reporting ==========
    
    def get_stats(self) -> Dict:
        """Get dashboard statistics"""
        try:
            days = self.get_all_days()
            recordings = self.get_all_recordings()
            
            unlocked = sum(1 for d in days if d.get('isUnlocked', False))
            
            return {
                'totalDays': len(days),
                'unlockedDays': unlocked,
                'lockedDays': len(days) - unlocked,
                'recordingsAvailable': len(recordings),
                'lastUpdated': datetime.utcnow().isoformat() + 'Z'
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {}
    
    # ========== Sync to GitHub ==========
    
    def export_for_github(self, output_dir: str = 'data') -> bool:
        """Export data to JSON files for GitHub commit"""
        try:
            os.makedirs(output_dir, exist_ok=True)
            
            # Export training days
            days = self.get_all_days()
            with open(f"{output_dir}/training_days.json", 'w') as f:
                json.dump(days, f, indent=2)
            
            # Export recordings
            recordings = self.get_all_recordings()
            with open(f"{output_dir}/recordings.json", 'w') as f:
                json.dump(recordings, f, indent=2)
            
            # Export stats
            stats = self.get_stats()
            with open(f"{output_dir}/stats.json", 'w') as f:
                json.dump(stats, f, indent=2)
            
            print(f"✅ Data exported to {output_dir}/")
            return True
            
        except Exception as e:
            print(f"❌ Error exporting data: {e}")
            return False
    
    # ========== Helper Methods ==========
    
    @staticmethod
    def _generate_uuid() -> str:
        """Generate UUID v4"""
        import uuid
        return str(uuid.uuid4())
    
    @staticmethod
    def _generate_embed_url(video_url: str) -> str:
        """Convert video URL to embed URL"""
        # YouTube
        if 'youtube.com/watch' in video_url:
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(video_url).query)
            video_id = query.get('v', [None])[0]
            if video_id:
                return f"https://www.youtube.com/embed/{video_id}"
        
        if 'youtu.be/' in video_url:
            video_id = video_url.split('youtu.be/')[1].split('?')[0]
            return f"https://www.youtube.com/embed/{video_id}"
        
        # Vimeo
        if 'vimeo.com/' in video_url:
            video_id = video_url.split('vimeo.com/')[1].split('?')[0]
            return f"https://player.vimeo.com/video/{video_id}"
        
        # Google Drive
        if 'drive.google.com' in video_url:
            import re
            file_id_match = re.search(r'/d/([^/]+)', video_url) or re.search(r'id=([^&]+)', video_url)
            if file_id_match:
                file_id = file_id_match.group(1)
                return f"https://drive.google.com/file/d/{file_id}/preview"
        
        return video_url
    
    @staticmethod
    def _get_default_days() -> List[Dict]:
        """Get default training days structure"""
        titles = [
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
        ]
        
        return [
            {
                'dayNumber': i + 1,
                'title': title,
                'isUnlocked': False,
                'unlockedAt': None,
                'unlockedBy': None
            }
            for i, title in enumerate(titles)
        ]


# ========== CLI Interface ==========

def main():
    """Command-line interface for admin operations"""
    import sys
    
    client = FabricAdminClient()
    
    if len(sys.argv) < 2:
        print("""
Power BI Training Admin Tool

Usage:
  python admin_fabric.py <command> [args]

Commands:
  unlock <day>          Unlock a specific day (1-12)
  lock <day>            Lock a specific day
  unlock-all            Unlock all 12 days
  
  upload <day> <title> <url> <duration>
                        Upload recording for a day
                        Example: upload 1 "Day 1 Recording" "https://youtube.com/..." "2h 30min"
  
  remove <day>          Remove recording for a day
  
  stats                 Show current statistics
  export                Export data to data/ folder for GitHub
  
  list                  List all days and their status

Examples:
  python admin_fabric.py unlock 1
  python admin_fabric.py unlock-all
  python admin_fabric.py upload 1 "Session 1" "https://youtu.be/xxx" "2h"
  python admin_fabric.py export
        """)
        sys.exit(1)
    
    command = sys.argv[1].lower()
    
    try:
        if command == 'unlock' and len(sys.argv) >= 3:
            day = int(sys.argv[2])
            client.unlock_day(day)
        
        elif command == 'lock' and len(sys.argv) >= 3:
            day = int(sys.argv[2])
            client.lock_day(day)
        
        elif command == 'unlock-all':
            client.unlock_all_days()
        
        elif command == 'upload' and len(sys.argv) >= 6:
            day = int(sys.argv[2])
            title = sys.argv[3]
            url = sys.argv[4]
            duration = sys.argv[5]
            client.upload_recording(day, title, url, duration)
        
        elif command == 'remove' and len(sys.argv) >= 3:
            day = int(sys.argv[2])
            client.remove_recording(day)
        
        elif command == 'stats':
            stats = client.get_stats()
            print("\n📊 Training Portal Statistics:")
            print(json.dumps(stats, indent=2))
        
        elif command == 'export':
            client.export_for_github()
        
        elif command == 'list':
            days = client.get_all_days()
            print("\n📚 Training Days Status:\n")
            for day in days:
                status = "🔓 Unlocked" if day.get('isUnlocked') else "🔒 Locked"
                print(f"Day {day['dayNumber']:2d}: {status} - {day['title']}")
        
        else:
            print(f"❌ Unknown command or invalid arguments: {command}")
            sys.exit(1)
    
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

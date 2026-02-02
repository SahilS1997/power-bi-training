# Admin Portal Documentation

## 🔐 Access Credentials

**Admin Portal URL:** `Admin_Portal.html`

**Login Credentials:**
- **Username:** `admin@powerbi.training`
- **Password:** `PowerBI2026Admin!`

---

## 📋 Admin Portal Features

### 1. **Dashboard Overview**
- View real-time statistics of unlocked days, available recordings, and locked content
- Clean, professional interface with glassmorphism design
- Quick access to all content management functions

### 2. **Content Control**
Manage access to all 12 training days:
- **🔓 Unlock Day** - Make content accessible to users
- **🔒 Lock Day** - Restrict access to content
- **Unlock All** - Quickly unlock all 12 days at once

### 3. **Recording Management**
Upload and manage session recordings for each day:
- **📤 Upload Recording** - Add recording URL, title, and duration
- **✏️ Edit Recording** - Update existing recording details
- **🗑️ Remove Recording** - Delete recordings

**Supported Platforms:**
- YouTube
- Vimeo  
- Direct video URLs (.mp4, .webm)
- Any embeddable video link

### 4. **Progressive Unlocking**
- By default, all days are locked
- Admin must manually unlock each day after session completion
- Users can only access unlocked content
- Recordings are only visible for unlocked days

---

## 🎯 How It Works

### User Experience Flow

1. **Initial State**
   - All 12 days are locked by default
   - Users see "🔒 LOCKED" overlay on locked content
   - No access to presentations or materials

2. **After Admin Unlocks Day**
   - Lock overlay removes
   - "View Presentation" button becomes clickable
   - Learning resources become accessible

3. **When Recording Is Added**
   - "📹 Recording Available" badge appears
   - "Watch Recording" button added to day card
   - Users can stream the recording directly

### Admin Workflow

**Daily Session Management:**
```
1. Conduct training session for Day X
2. Log into Admin Portal
3. Upload session recording:
   - Enter video URL (YouTube/Vimeo)
   - Add title (e.g., "Day 3 Live Session Recording")
   - Specify duration (e.g., "2h 30min")
4. Click "🔓 Unlock" for Day X
5. Users can now access Day X content + recording
```

---

## 🔧 Technical Details

### Data Storage
- Uses browser `localStorage` for demo purposes
- State key: `powerbi_content_state`
- Stores: `unlockedDays` array and `recordings` object

### State Structure
```javascript
{
  "unlockedDays": [1, 2, 3],
  "recordings": {
    "1": {
      "url": "https://youtube.com/watch?v=...",
      "title": "Session Recording - Day 1",
      "duration": "2h 15min"
    }
  }
}
```

### Security Notes

⚠️ **Important for Production:**

This is a **client-side demo** implementation. For production use:

1. **Backend Authentication Required**
   - Implement proper server-side auth (JWT, OAuth, etc.)
   - Store credentials securely in database
   - Use HTTPS only

2. **Database Storage**
   - Move from localStorage to backend database
   - MongoDB, PostgreSQL, or Firebase recommended
   - Implement API endpoints for CRUD operations

3. **Content Protection**
   - Implement server-side access control
   - Use signed URLs for video content
   - Add video DRM if needed

4. **User Management**
   - Create user authentication system
   - Track individual user progress
   - Implement role-based access control (RBAC)

---

## 📱 User Interface Changes

### Main Portal (PowerBI_Training_Portal.html)

**New Features:**
- Admin icon (⚙️) in navigation bar
- Locked day cards with overlay
- Recording badges and buttons
- Dynamic content visibility

**Day Card States:**
```
Locked Day:
  - Greyed out appearance
  - "🔒 LOCKED" overlay
  - Disabled buttons

Unlocked Day:
  - Normal appearance
  - Clickable buttons
  - Access to all content

Day with Recording:
  - "📹 Recording Available" badge
  - "Watch Recording" button
  - Links to video URL
```

---

## 🚀 Quick Start Guide

### For Administrators

1. **Access Admin Portal**
   ```
   Navigate to: https://sahils1997.github.io/power-bi-training/Admin_Portal.html
   ```

2. **Login**
   ```
   Username: admin@powerbi.training
   Password: PowerBI2026Admin!
   ```

3. **Unlock First Day**
   - Locate "Day 1" in the dashboard
   - Click "🔓 Unlock" button
   - Confirm day is marked as unlocked

4. **Upload First Recording**
   - Click "📤 Upload Recording" on Day 1
   - Enter YouTube/Vimeo URL
   - Add title and duration
   - Click "Save Recording"

5. **Verify on User Portal**
   - Open main portal in different browser/tab
   - Day 1 should be accessible
   - Recording button should appear

### For Users

1. **Access Training Portal**
   ```
   Navigate to: https://sahils1997.github.io/power-bi-training/
   ```

2. **View Available Content**
   - Unlocked days are fully accessible
   - Locked days show lock overlay
   - Can't access future content until unlocked

3. **Watch Recordings**
   - Click "Watch Recording" button
   - Opens in new tab
   - Stream directly from platform

---

## 🔄 Progressive Content Release Strategy

### Recommended Schedule

**Week 1:**
- Day 1: Unlock on Session Day
- Day 2: Unlock after Day 2 completion
- Day 3: Unlock after Day 3 completion

**Week 2:**
- Days 4-6: Progressive unlocking

**Week 3:**
- Days 7-9: Progressive unlocking

**Week 4:**
- Days 10-12: Progressive unlocking

### Benefits
- Prevents overwhelming students
- Ensures proper pacing
- Encourages attendance
- Maintains engagement throughout program

---

## 💡 Pro Tips

1. **Recording Uploads**
   - Upload recordings within 24 hours of session
   - Include session date in title
   - Test video URL before saving

2. **Content Strategy**
   - Unlock content immediately after live session
   - Keep 1-2 days ahead unlocked for preparation
   - Don't unlock all at once - reduces engagement

3. **Communication**
   - Notify students when new content unlocks
   - Send reminders about available recordings
   - Use LinkedIn/email for announcements

4. **Quality Control**
   - Test unlocked content from user perspective
   - Verify recording quality before upload
   - Update recordings if better version available

---

## 🛠️ Troubleshooting

### Issue: Content Not Unlocking
**Solution:** Clear browser cache and localStorage
```javascript
localStorage.removeItem('powerbi_content_state')
```

### Issue: Recording Not Playing
**Solution:** 
- Verify URL is correct and public
- Check video platform privacy settings
- Use embeddable links

### Issue: Lost Admin Access
**Solution:** 
- Clear auth token:
```javascript
localStorage.removeItem('admin_authenticated')
```
- Re-login with credentials

---

## 📊 Analytics & Reporting

### Current Limitations (Client-side)
- No user tracking
- No view analytics
- No completion metrics

### Recommended Backend Features
- User progress tracking
- Video view analytics
- Completion certificates
- Engagement metrics
- Quiz/assessment integration

---

## 🔮 Future Enhancements

### Planned Features
1. **User Authentication**
   - Individual user accounts
   - Progress tracking per user
   - Certificate generation

2. **Advanced Content Management**
   - Quiz integration
   - Downloadable resources
   - Discussion forums

3. **Analytics Dashboard**
   - Student progress tracking
   - Engagement metrics
   - Completion rates

4. **Mobile App**
   - iOS/Android applications
   - Offline content access
   - Push notifications

---

## 📞 Support

For technical issues or questions:
- **Email:** Contact through training portal
- **LinkedIn:** [Sahil Sreedharan](https://www.linkedin.com/in/sahil-sreedharan/)

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0
**Platform:** GitHub Pages (Static Site)

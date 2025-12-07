# 🔐 Admin Panel Guide - WeatherPro

## 🎯 Admin Access

### Login Credentials
- **Username:** `admin`
- **Password:** `abhinav123`
- **Email:** admin@weatherpro.com

### How to Access Admin Panel

1. **Login First**
   - Go to: `http://localhost:3000/login`
   - Enter username: `admin`
   - Enter password: `abhinav123`
   - Click "Sign In"

2. **Access Admin Panel**
   - After logging in, go to: `http://localhost:3000/admin`
   - Or manually type the URL in your browser

## 🎨 Admin Panel Features

### 📊 Dashboard Overview
- **Total Users** - See how many users are registered
- **Saved Locations** - Total locations saved by all users
- **Active Alerts** - Number of active weather alerts
- **Active Users** - Users who logged in today
- **Recent Users List** - Latest registered users
- **System Activity** - Recent system events

### 👥 Users Management
**View All Users:**
- See complete list of all registered users
- View user details (ID, username, email, full name)
- Check admin status
- See registration date and last login

**Edit Users:**
1. Click "Edit" button next to any user
2. Modify username, email, or full name
3. Toggle admin privileges (make user admin or remove admin)
4. Click "Save Changes"

**Delete Users:**
1. Click "Delete" button next to any user
2. Confirm deletion
3. User and all their data will be permanently removed

**Add New Users:**
1. Click "Add New User" button
2. Fill in user details
3. Set admin privileges if needed
4. Save

### 📍 All Locations
**View All Saved Locations:**
- See all locations saved by all users
- View which user saved each location
- See coordinates (latitude/longitude)
- Check if location is marked as favorite
- Filter by specific user

**Delete Locations:**
- Remove any location from any user
- Click "Delete" button and confirm

### 🔔 Weather Alerts Management
**View All Alerts:**
- See all weather alerts from all users
- View alert type and threshold values
- Check if alert is active or inactive
- See creation date

**Delete Alerts:**
- Remove any alert
- Click "Delete" and confirm

### ⚙️ System Settings
**Database Information:**
- View database name
- See number of tables
- Backup database (coming soon)

**API Configuration:**
- Check Weather API status
- View API provider

**Security Settings:**
- Enable/disable email verification
- Toggle rate limiting
- Configure security options

**Maintenance:**
- Clear cache
- Delete inactive users
- System cleanup tools

## 🔑 Admin Privileges

As an admin, you can:
- ✅ View all user data
- ✅ Edit any user account
- ✅ Delete users (except yourself)
- ✅ Make other users admins
- ✅ View all saved locations
- ✅ Delete any location
- ✅ View all weather alerts
- ✅ Delete any alert
- ✅ Access system settings
- ✅ View system statistics
- ✅ Perform maintenance tasks

## 🚀 Quick Actions

### Make Another User Admin
1. Go to "Users Management"
2. Click "Edit" on the user
3. Check "Admin Privileges" checkbox
4. Click "Save Changes"

### Remove Admin Privileges
1. Go to "Users Management"
2. Click "Edit" on the admin user
3. Uncheck "Admin Privileges" checkbox
4. Click "Save Changes"

### Delete Inactive Users
1. Go to "System Settings"
2. Click "Delete Inactive Users"
3. Confirm action
4. Users who haven't logged in for 90 days will be removed

### View User Activity
1. Go to "Dashboard"
2. Check "Recent Users" section
3. See latest registrations
4. Check "Active Users" count for today's activity

## 🎨 Admin Panel Navigation

**Sidebar Menu:**
- 📊 Dashboard - Overview and statistics
- 👥 Users Management - Manage all users
- 📍 All Locations - View and manage locations
- 🔔 Weather Alerts - Manage alerts
- ⚙️ System Settings - Configure system
- 🏠 User Dashboard - Go back to regular dashboard

**Header Actions:**
- 🔄 Refresh - Reload current data
- 🌓 Theme Toggle - Switch dark/light mode
- 🚪 Logout - Sign out from admin panel

## 🔒 Security Notes

1. **Protect Admin Credentials**
   - Change default password immediately
   - Use strong, unique password
   - Don't share admin credentials

2. **Admin Actions are Permanent**
   - Deleted users cannot be recovered
   - Deleted data is permanently removed
   - Always confirm before deleting

3. **Be Careful with Admin Privileges**
   - Only give admin access to trusted users
   - Regularly review admin users
   - Remove admin access when no longer needed

4. **Cannot Delete Yourself**
   - You cannot delete your own admin account
   - This prevents accidental lockout
   - Have another admin remove you if needed

## 📱 Mobile Access

The admin panel is fully responsive:
- Works on tablets and phones
- Touch-friendly interface
- Collapsible sidebar on mobile
- Optimized tables for small screens

## 🆘 Troubleshooting

**Can't Access Admin Panel?**
- Make sure you're logged in as admin
- Check URL is correct: `http://localhost:3000/admin`
- Verify admin privileges in database

**"Access Denied" Error?**
- Your account doesn't have admin privileges
- Contact another admin to grant access
- Check database: `is_admin` should be `1`

**Data Not Loading?**
- Click refresh button
- Check server is running
- Verify database connection
- Check browser console for errors

## 🎯 Best Practices

1. **Regular Monitoring**
   - Check dashboard daily
   - Review new user registrations
   - Monitor system activity

2. **User Management**
   - Remove spam accounts promptly
   - Verify suspicious users
   - Keep user data clean

3. **Data Cleanup**
   - Regularly delete old/unused locations
   - Remove inactive alerts
   - Clean up test data

4. **Security**
   - Change admin password regularly
   - Review admin users monthly
   - Monitor for suspicious activity

## 📊 Statistics Explained

- **Total Users** - All registered accounts
- **Saved Locations** - Sum of all locations from all users
- **Active Alerts** - Alerts with `is_active = TRUE`
- **Active Today** - Users who logged in within last 24 hours

## 🎉 You're All Set!

Your admin panel is ready to use. Access it at:
```
http://localhost:3000/admin
```

Login with:
- Username: `admin`
- Password: `abhinav123`

**Remember to change the default password!**

---

**Happy Administrating! 🌤️👨‍💼**

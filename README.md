# Visitor-Log

**Live Link:** [https://habibiyyasin.github.io/Visitor-Log/](https://habibiyyasin.github.io/Visitor-Log/) 

1. 📌 System Overview

The NEU Library Visitor Log System is a web-based application designed to digitally record and manage visitor entries in the New Era University Library. It replaces manual logbooks with an automated system that ensures accurate data collection, secure access, and real-time monitoring.

The system consists of two main modules:

Visitor Interface (Frontend)
Admin Dashboard (Backend)

It uses Supabase for authentication and database management.

2. 🎯 Objectives
Digitize the visitor logging process
Ensure only authorized users (NEU accounts) can log entries
Provide real-time monitoring for administrators
Enable data filtering, searching, and exporting
Improve security through account blocking

3. 🏗️ System Architecture
Technologies Used:
Frontend: HTML, CSS, Bootstrap 5
Backend (BaaS): Supabase
Authentication: Google OAuth (Supabase Auth)
Database: Supabase PostgreSQL
Libraries:
Bootstrap Icons
SweetAlert2

4. 👥 User Roles
4.1 Visitor (Student / Faculty)
Logs entry into the library
Uses Google account (@neu.edu.ph)
Selects:
College
Program / Position
Purpose of visit

4.2 Admin
Logs in via authorized emails
Views dashboard analytics
Filters visitor data
Searches logs
Exports logs to CSV
Blocks/unblocks users

5. 🔐 Authentication & Security
Google Authentication
Uses Supabase OAuth with Google

Restriction:

Only emails ending with @neu.edu.ph are allowed
Admin Authorization
Controlled via:
const ALLOWED_ADMINS = [
  'habibiy.yasin@neu.edu.ph',
  'jcesperanza@neu.edu.ph'
];
Block System
Admin can block users
Blocked users cannot log entries
System checks:
status = 'blocked'

6. 🧩 System Modules
6.1 Visitor Module
Features:
Google Login
Auto-detect user name
College & Program selection
Reason for visit
Entry confirmation
Auto logout after submission
Workflow:
User clicks Sign in with Google
System validates email domain
User selects details
Data is saved to database
Success message is shown
System resets after 5 seconds

6.2 Admin Dashboard
Features:
Secure login
Real-time visitor statistics
Filtering system
Search functionality
CSV export
Block/Unblock users

7. 📊 Dashboard Features
Statistics:
Total Visits
Students Count
Employees Count
Filters:
Time:
Today
This Week
Custom Date Range
Purpose
College
User Type (Student / Faculty)

8. 🗄️ Database Structure
Table: visitor_logs
Column Name	Type	Description
id	UUID	Primary Key
full_name	Text	Visitor name
email	Text	User email
college	Text	Selected college
program	Text	Program or position
reason	Text	Purpose of visit
status	Text	active / blocked
created_at	Timestamp	Date & time

9. 🔍 Key Functionalities
9.1 Insert Visitor Log
_db.from('visitor_logs').insert([
  {
    full_name,
    email,
    college,
    program,
    reason
  }

]);
9.2 Filter Logs
By date
By purpose
By college
By type

9.3 Search Logs
Real-time search using input field

9.4 Export to CSV
Converts filtered data into downloadable file

9.5 Block / Unblock User
_db.from('visitor_logs')
  .update({ status: 'blocked' })
  .eq('id', id);

  10. 🎨 UI/UX Design
Visitor Interface:
Centered login card
Clean and simple form
Animated success message
Admin Dashboard:
Sidebar navigation
Cards for statistics
Responsive table
Filter panel

11. ⚠️ Error Handling
Invalid email → Access denied
Blocked user → Login prevented
Missing fields → Validation alert
Database errors → Console + alert

12. 🚀 System Advantages
Paperless logging
Secure authentication
Easy data retrieval
Real-time monitoring
Admin control over users

13. 🔧 Possible Improvements
Add QR code scanning
Add analytics charts (graphs)
Role-based admin levels
Email notifications
Dark mode UI
Mobile app version

14. 📌 Conclusion

The NEU Library Visitor Log System provides a modern, efficient, and secure way to manage visitor records. By integrating authentication, filtering, and admin controls, the system significantly improves operational efficiency and data accuracy within the library.

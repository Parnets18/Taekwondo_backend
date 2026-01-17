# Combat Warrior Taekwon-do Institute - Backend API

A comprehensive backend system for managing a martial arts institute with admin panel, student management, admissions, and more.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** (JWT-based)
- **Admission Management** (Applications, Reviews, Approvals)
- **Student Management** (Profiles, Attendance, Belt Progression)
- **Contact Form Management** (Inquiries, Responses)
- **Course Management** (Programs, Schedules, Enrollment)
- **Admin Dashboard** (Statistics, Analytics)

### Advanced Features
- **Email Notifications** (Confirmations, Admin Alerts)
- **File Upload Support** (Documents, Images)
- **Data Validation** (Comprehensive input validation)
- **Security** (Helmet, CORS, Rate Limiting)
- **Error Handling** (Centralized error management)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Gmail account (for email notifications)

## 🛠️ Installation

1. **Clone and Navigate**
   ```bash
   cd institute-website-backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/combat_warrior_institute
   
   # JWT
   JWT_SECRET=your_super_secret_jwt_key_here
   
   # Email (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Admin
   ADMIN_EMAIL=admin@combatwarrior.com
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Admission Endpoints

#### Submit Application
```http
POST /admissions
Content-Type: application/json

{
  "fullName": "John Doe",
  "dateOfBirth": "1995-01-15",
  "gender": "male",
  "phone": "+1234567890",
  "email": "john@example.com",
  "address": "123 Main St, City, State",
  "courseLevel": "beginner",
  "preferredSchedule": "evening",
  "emergencyContactName": "Jane Doe",
  "emergencyContactPhone": "+1234567891",
  "relationshipToStudent": "parent",
  "medicalConditions": "None"
}
```

#### Check Application Status
```http
GET /admissions/status/john@example.com
```

### Contact Endpoints

#### Submit Contact Form
```http
POST /contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "inquiryType": "admission",
  "message": "I'm interested in joining your academy.",
  "isSubscribed": true
}
```

### Admin Endpoints (Requires Authentication)

#### Dashboard Statistics
```http
GET /admin/dashboard
Authorization: Bearer <admin_token>
```

#### Get All Admissions
```http
GET /admin/admissions?status=pending&page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Update Admission Status
```http
PUT /admin/admissions/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "approved",
  "adminNotes": "Excellent candidate"
}
```

### Student Management Endpoints

#### Get All Students
```http
GET /students?status=active&page=1&limit=10
Authorization: Bearer <staff_token>
```

#### Add Attendance
```http
POST /students/:id/attendance
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "date": "2025-01-15",
  "status": "present",
  "notes": "Good participation"
}
```

#### Record Belt Promotion
```http
POST /students/:id/belt-promotion
Authorization: Bearer <staff_token>
Content-Type: application/json

{
  "belt": "yellow",
  "notes": "Passed all requirements"
}
```

### Course Management Endpoints

#### Get All Courses (Public)
```http
GET /courses?level=beginner
```

#### Create Course (Admin)
```http
POST /courses
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Beginner Taekwon-do",
  "level": "beginner",
  "description": "Introduction to Taekwon-do fundamentals",
  "duration": {
    "months": 3,
    "sessionsPerWeek": 3,
    "sessionDuration": 60
  },
  "fees": {
    "registrationFee": 1000,
    "monthlyFee": 2000,
    "examFee": 500
  },
  "ageGroup": {
    "min": 6,
    "max": 60
  },
  "maxStudents": 20,
  "schedule": [
    {
      "day": "monday",
      "startTime": "18:00",
      "endTime": "19:00"
    }
  ]
}
```

## 🔐 Authentication & Authorization

### User Roles
- **Student**: Basic access to own data
- **Instructor**: Access to student management
- **Admin**: Full system access

### JWT Token
Include in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📧 Email Configuration

### Gmail Setup
1. Enable 2-Factor Authentication
2. Generate App Password
3. Use App Password in `EMAIL_PASS`

### Email Templates
- Admission confirmation
- Contact form confirmation
- Admin notifications

## 🗄️ Database Schema

### Collections
- **users**: User accounts and authentication
- **admissions**: Application submissions
- **students**: Student profiles and records
- **contacts**: Contact form submissions
- **courses**: Course information and schedules

### Key Relationships
- Admission → Student (upon approval)
- User → Student (account linking)
- Course → Students (enrollment)

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **JWT**: Secure authentication
- **Bcrypt**: Password hashing
- **Input Validation**: Request validation
- **Rate Limiting**: API protection

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Error Handling**: Centralized error management
- **Health Check**: `/api/health` endpoint

## 🚀 Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db
JWT_SECRET=your-production-secret
EMAIL_USER=your-production-email
EMAIL_PASS=your-production-password
```

### PM2 (Process Manager)
```bash
npm install -g pm2
pm2 start server.js --name "combat-warrior-api"
pm2 startup
pm2 save
```

## 🧪 Testing

### Manual Testing
Use tools like Postman or Thunder Client with the provided endpoints.

### Health Check
```bash
curl http://localhost:5000/api/health
```

## 📝 Default Admin Account

After first startup, a default admin account is created:
- **Email**: admin@combatwarrior.com
- **Password**: admin123

**⚠️ Change these credentials immediately in production!**

## 🤝 Support

For issues or questions:
- Check the logs: `npm run dev`
- Verify MongoDB connection
- Ensure all environment variables are set
- Check email configuration for notifications

## 📄 License

This project is licensed under the ISC License.
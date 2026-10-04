# Tuition Management System

A complete web application for managing tuition center operations, including student management, fee tracking, payment recording, and teacher payroll.

## Features

✅ **Student Management** - Add/edit students with multiple subject enrollment
✅ **Fee Tracking** - Track which subjects each student takes and their fees
✅ **Payment Recording** - Log payments (cash/online) with receipt generation
✅ **Teacher Management** - Manage teachers with fixed monthly salaries
✅ **Dashboard** - Real-time overview of collections, pending fees, and stats
✅ **Reports** - Pending fees, monthly collections, teacher payroll reports
✅ **User Authentication** - Secure login system for your mom

## Tech Stack

- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Local Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Setup Database

```bash
# Create a .env file
cp .env.example .env

# Edit .env with your database details
# DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/tuition_db

# Initialize database (creates all tables)
node init-db.js
```

### 3. Create Demo Admin User

```bash
# This will be done through the login page signup
# Username: demo
# Password: demo
```

### 4. Start Backend Server

```bash
npm start
# Server will run on http://localhost:5000
```

### 5. Start Frontend (in another terminal)

```bash
cd frontend
npm start
# App will open on http://localhost:3000
```

## Project Structure

```
tuition-app/
├── server.js              # Express server with all API routes
├── init-db.js             # Database initialization script
├── package.json           # Backend dependencies
├── .env.example           # Environment variables template
│
└── frontend/
    ├── src/
    │   ├── App.jsx        # Main app with routing
    │   ├── index.jsx      # React entry point
    │   ├── index.css      # Global styles + Tailwind
    │   ├── pages/         # All page components
    │   │   ├── Dashboard.jsx
    │   │   ├── Students.jsx
    │   │   ├── Payments.jsx
    │   │   ├── Teachers.jsx
    │   │   ├── Reports.jsx
    │   │   └── Login.jsx
    │   └── components/    # Reusable components
    │       └── Navbar.jsx
    ├── public/
    │   └── index.html
    └── package.json       # Frontend dependencies
```

## Database Schema

### Core Tables

- **students** - Student information (name, phone, address)
- **subjects** - Subject catalog (Math, Science, Hindi, Social)
- **enrollments** - Student-Subject-Fee mapping
- **payments** - Payment records
- **teachers** - Teacher information and monthly salaries
- **admin_users** - Login credentials

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Create account

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Add new student
- `GET /api/students/:id` - Get student details
- `PUT /api/students/:id` - Update student

### Subjects
- `GET /api/subjects` - List all subjects
- `POST /api/subjects` - Add new subject

### Enrollments
- `GET /api/enrollments/student/:studentId` - Get student's subjects
- `POST /api/enrollments` - Enroll student in subject
- `DELETE /api/enrollments/:id` - Remove enrollment

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Record payment
- `GET /api/payments/student/:studentId` - Get student's payment history

### Teachers
- `GET /api/teachers` - List all teachers
- `POST /api/teachers` - Add teacher
- `PUT /api/teachers/:id` - Update teacher

### Reports
- `GET /api/reports/pending-fees` - Students with pending fees
- `GET /api/reports/monthly-collection` - Monthly collection summary
- `GET /api/reports/teacher-payroll` - Teacher payroll report

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

## Deployment (Railway.app - Recommended)

Railway.app is free, easy, and perfect for this app.

### Step 1: Prepare for Deployment

```bash
# Create a Dockerfile in project root
cat > Dockerfile << 'EOF'
FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
EOF

# Create .dockerignore
echo "node_modules
.git
.env
frontend/node_modules
frontend/build" > .dockerignore
```

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click "Create New Project"
3. Select "Deploy from GitHub"
4. Connect your GitHub account
5. Select this repository
6. Click "Deploy"

### Step 3: Add Database (PostgreSQL) on Railway

1. In Railway dashboard, click "Add"
2. Select "PostgreSQL"
3. Wait for it to provision
4. Copy the database URL from Variables
5. Add as environment variable `DATABASE_URL`

### Step 4: Add Other Environment Variables

In Railway dashboard, add these variables:
- `DATABASE_URL` - (auto-generated by PostgreSQL plugin)
- `JWT_SECRET` - (any random string, e.g., `super-secret-key-2024`)
- `NODE_ENV` - `production`
- `PORT` - `5000`

### Step 5: Initialize Database

1. After deployment, click on your app in Railway
2. Go to "Deployments"
3. Click "Latest" → "Logs"
4. You should see the database tables created automatically

### Step 6: Access Your App

- Get the URL from Railway dashboard
- Share it with your mom
- Create an account via signup
- Start managing the tuition center!

## Alternative Deployment Options

### Render.com

1. Go to https://render.com
2. Create account and connect GitHub
3. Create new Web Service
4. Select repository
5. Add PostgreSQL database
6. Deploy

### Heroku (Deprecated but still works)

1. Install Heroku CLI
2. `heroku login`
3. `heroku create your-app-name`
4. `heroku addons:create heroku-postgresql:hobby-dev`
5. `git push heroku main`

### Local Production (VPS/Server)

```bash
# On your server
sudo apt-get update
sudo apt-get install nodejs npm postgresql

# Clone repo and setup
git clone <your-repo>
cd tuition-app
npm install
cd frontend && npm run build && cd ..

# Start with PM2
npm install -g pm2
pm2 start server.js
pm2 save
```

## Usage Guide

### First Time Setup

1. **Create Admin Account**
   - Signup with your details
   - Use this account to manage everything

2. **Add Subjects**
   - Go to Students page
   - Click on any student first
   - System will prompt you to add subjects

3. **Add Teachers**
   - Go to Teachers page
   - Add all 4 teachers with their monthly salaries
   - Assign subjects to them

4. **Add Students**
   - Go to Students page
   - Click "+ Add Student"
   - Enter their details
   - Add which subjects they're taking and fees for each

5. **Record Payments**
   - Go to Payments
   - Click "Record Payment"
   - Select student, amount, date, payment method
   - System generates receipt

6. **View Reports**
   - Go to Reports
   - See pending fees, monthly collections, teacher payroll

## Troubleshooting

### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Make sure PostgreSQL is running:
```bash
# Mac
brew services start postgresql

# Linux
sudo service postgresql start

# Windows
# Search for "Services" and start PostgreSQL
```

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution**: Change PORT in .env or kill process:
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Database Not Initializing

**Solution**: Manually run init script:
```bash
node init-db.js
```

## Features to Add Later

- [ ] SMS/WhatsApp receipt notifications
- [ ] Student/Parent login portal
- [ ] Attendance tracking
- [ ] Expense tracking
- [ ] Export reports to PDF/Excel
- [ ] Batch payment recording
- [ ] Revenue-share tracking for special classes

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check PostgreSQL is running
4. Verify .env file has correct database URL

## License

MIT - Free to use and modify

---

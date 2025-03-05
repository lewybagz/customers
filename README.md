# Customer Tracking System

A comprehensive full-stack solution for managing customer relationships, interactions, and job tracking. Built with NestJS (Backend) and React + Vite (Frontend), utilizing GraphQL for efficient data operations.

## 🏗️ Architecture

The project is structured as a monorepo with two main components:

- **Backend**: NestJS application with GraphQL API
- **Frontend**: React application built with Vite and TypeScript

### Technology Stack

#### Backend

- NestJS v11
- GraphQL with Apollo Server
- PostgreSQL with Prisma ORM
- JWT Authentication
- TypeScript
- Jest for testing

#### Frontend

- React 19
- Vite
- TypeScript
- TailwindCSS
- Apollo Client
- Zustand for state management
- React Query

## 🚀 Features

- **User Management**

  - Role-based authentication (Admin, Manager, User)
  - JWT-based secure authentication
  - User profile management

- **Customer Management**

  - Comprehensive customer profiles
  - Status tracking (Active, Inactive, Lead)
  - Contact information management
  - Company and address details

- **Interaction Tracking**

  - Record various types of customer interactions
  - Chronological interaction history
  - Notes and follow-ups

- **Job Management**
  - Create and track customer jobs
  - Priority levels and status updates
  - Due date tracking
  - Job completion workflow

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (>= v20)
- PostgreSQL
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/customer_tracking"
JWT_SECRET="your-secret-key"
```

4. Run Prisma migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run start:dev
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```bash
VITE_API_URL="http://localhost:3000/graphql"
```

4. Start the development server:

```bash
npm run dev
```

## 📚 API Documentation

The GraphQL API documentation is available at `/graphql` when running the backend server in development mode. This provides an interactive GraphQL playground for testing queries and mutations.

### Main Entity Types

- User
- Customer
- Interaction
- Job

## 🧪 Testing

### Backend Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
# Run tests
npm run test
```

## 🚀 Deployment

### Backend Deployment

1. Build the application:

```bash
npm run build
```

2. Set production environment variables
3. Run the production server:

```bash
npm run start:prod
```

### Frontend Deployment

1. Build the application:

```bash
npm run build
```

2. Deploy the contents of the `dist` directory to your hosting service

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Environment variable protection
- GraphQL query complexity limits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 👥 Authors

- LewyBagz - Initial work

## 🙏 Acknowledgments

- NestJS team for the excellent framework
- React team for the frontend framework
- All contributors and maintainers

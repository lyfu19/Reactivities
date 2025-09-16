# Reactivities – Full Stack Social App

A full stack social web application built with **ASP.NET Core, C#, EF Core, SQL Server, and React (TypeScript)**.  
The project demonstrates a modern architecture with authentication, social login, activity management, and real-time features.

🌐 **Live Demo (Azure App Service)**: [https://alfie-reactivities.azurewebsites.net](https://alfie-reactivities.azurewebsites.net)

---

## ✨ Features

- 🔐 **Authentication & Authorization**

  - User registration and login
  - Social login (Google, GitHub)
  - Password reset and email confirmation
  - Role-based access control
  - Cookie-based authentication with ASP.NET Identity

- 📅 **Activities Management**

  - Create, update, delete activities
  - Join and leave events
  - Pagination, filtering, and sorting

- 💬 **Real-time Communication**

  - Live chat using SignalR
  - Notifications for activity updates

- 👤 **User Profiles**

  - Manage profile information and bio
  - Upload and manage profile photos
  - Follow/unfollow users

- ⚙️ **Infrastructure**
  - REST API with clean architecture (Application, Domain, Persistence, Infrastructure layers)
  - Entity Framework Core with SQL Server
  - Docker and GitHub Actions for CI/CD
  - Deployed on Azure App Service

---

## 👤 Demo Account

To explore the application without creating a new account, you can use the following demo credentials:

- **Email**: bob@test.com
- **Password**: Pa$$w0rd

Note: This is a shared demo account. Please avoid changing the password or deleting data.

---

## 🛠 Tech Stack

**Backend**

- ASP.NET Core 9 / C#
- Entity Framework Core
- SQL Server
- ASP.NET Identity (cookie-based authentication)
- SignalR

**Frontend**

- React (TypeScript)
- Vite
- React Query
- Material UI

**Other**

- Docker & Docker Compose
- GitHub Actions
- Azure App Service

---

## 🚀 Getting Started

### Prerequisites

- .NET 9 SDK
- Node.js (v18+ recommended)
- Docker Desktop

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/<your-username>/Reactivities.git
   cd Reactivities
   ```

2. Start database with Docker

   ```bash
   docker-compose up -d
   ```

3. Run backend

   ```bash
   cd API
   dotnet run
   ```

4. Run frontend
   ```bash
   cd client
   npm install
   npm run dev
   ```

Frontend → http://localhost:3000  
API → https://localhost:5001

---

## 🔑 Highlights

- Implemented clean architecture with Application, Domain, Persistence, and Infrastructure layers.
- Integrated cookie-based authentication and external social login with ASP.NET Identity.
- Built real-time chat using SignalR with activity-based channels.
- Automated CI/CD pipeline with GitHub Actions.
- Deployed to Azure App Service for production-ready hosting.

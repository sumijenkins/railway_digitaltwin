# Railway Digital Twin 🚄

A comprehensive digital twin system for railway simulation and real-time monitoring, enabling advanced analytics and visualization of railway operations.

## 📋 Overview

This project provides a full-stack solution for railway digital twin implementation, combining a robust Spring Boot backend with a modern React frontend to deliver real-time monitoring, data analytics, and interactive visualization capabilities.

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 4.0.2
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security
- **ORM**: JPA/Hibernate
- **Build Tool**: Maven

### Frontend
- **Framework**: React 18.3
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 6.3
- **UI Libraries**: 
  - Material-UI (MUI)
  - Radix UI
  - shadcn/ui components
- **Styling**: TailwindCSS 4
- **State Management**: React Hooks
- **Charts**: Recharts
- **Maps**: Leaflet / React-Leaflet
- **Animations**: Framer Motion

## 📁 Project Structure

```
railway_digital_twin/
├── railway-digital-twin-backend/    # Spring Boot REST API
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/              # Java source code
│   │   │   └── resources/         # Configuration files
│   │   └── test/                  # Unit tests
│   ├── pom.xml                    # Maven dependencies
│   └── mvnw, mvnw.cmd            # Maven wrapper
│
├── railway-digital-twin-frontend/   # React TypeScript SPA
│   ├── src/
│   │   ├── app/                   # Main application components
│   │   ├── services/              # API services
│   │   ├── types/                 # TypeScript type definitions
│   │   ├── utils/                 # Utility functions
│   │   └── styles/                # CSS styles
│   ├── package.json               # NPM dependencies
│   └── vite.config.ts            # Vite configuration
│
├── docker-compose.yml             # Docker services configuration
├── .env.example                   # Environment variables template
└── README.md                      # This file
```

## 🚀 Prerequisites

Before running this project, ensure you have the following installed:

- **Java 21** or higher ([Download](https://adoptium.net/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **PostgreSQL 13+** ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional, for containerized PostgreSQL)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd railway_digital_twin
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)

```bash
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the default credentials.

#### Option B: Manual PostgreSQL Setup

1. Create a database named `railway_digital_twin`
2. Update the connection details in the backend configuration

### 3. Backend Setup

```bash
cd railway-digital-twin-backend

# Copy environment template
cp .env.example .env

# Update .env with your database credentials

# Build the project
./mvnw clean install

# Run the backend
./mvnw spring-boot:run
```

The backend API will be available at `http://localhost:8080`

### 4. Frontend Setup

```bash
cd ../railway-digital-twin-frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your backend URL

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 🏃 Running the Application

### Development Mode

1. **Start PostgreSQL** (via Docker or local installation)
2. **Start Backend**:
   ```bash
   cd railway-digital-twin-backend
   ./mvnw spring-boot:run
   ```
3. **Start Frontend**:
   ```bash
   cd railway-digital-twin-frontend
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`

### Production Build

#### Backend
```bash
cd railway-digital-twin-backend
./mvnw clean package
java -jar target/railway-digital-twin-backend-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd railway-digital-twin-frontend
npm run build
npm run preview
```

## 🧪 Testing

### Backend Tests
```bash
cd railway-digital-twin-backend
./mvnw test
```

### Frontend Tests
```bash
cd railway-digital-twin-frontend
npm test
```

## 📊 Features

- 🎯 Real-time railway telemetry monitoring
- 📈 Interactive data visualization and analytics
- 🗺️ Geospatial mapping with Leaflet
- 📊 Advanced charting with Recharts
- 🔐 Secure authentication and authorization
- 📱 Responsive design for all devices
- 🌓 Dark mode support
- 🎨 Modern, professional UI with animations

## 🔧 Configuration

### Backend Configuration

Edit `railway-digital-twin-backend/src/main/resources/application.properties`:

```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/railway_digital_twin
spring.datasource.username=your_username
spring.datasource.password=your_password

# Server
server.port=8080
```

### Frontend Configuration

Edit `railway-digital-twin-frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Railway Digital Twin
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

Developed by the Railway Digital Twin Team

## 📮 Support

For questions or support, please open an issue or contact the development team.

---

**Happy Coding! 🚀**

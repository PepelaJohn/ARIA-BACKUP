# ARIA Logistics App

ARIA is a next-generation logistics platform connecting consumers, corporate clients, and service providers for efficient and real-time transportation services. From cabs to drones, ARIA offers a variety of options with live tracking, notifications, and a seamless user experience.

---

## Features

### 🚀 Core Functionality
- **Service Booking**: Book cabs, drones, planes, or trucks.
- **Real-Time Tracking**: Monitor provider and trip locations live.
- **Dynamic Routing**: Optimize routes for seamless trips.
- **Notifications**: Notify service providers in real-time about new bookings.
- **Role-Based Access**: Features tailored to specific user roles.

### 🛠 User Roles
1. **Consumers**: Book services, track trips, and rate providers.
2. **Corporate Clients**: Request bulk quotes and track logistics.
3. **Service Providers**: Manage fleets, accept jobs, and track revenue metrics.
4. **Admins**: Oversee operations, manage pricing, and approve fleets.

### 🌟 Additional Features
- **Dark Mode**: Professional and visually appealing UI.
- **Rating System**: Rate and review completed trips.
- **Map Integration**: Powered by Mapbox GL for dynamic routing and trip visualization.

---

## Project Structure

The project is divided into **frontend** and **backend** directories for modular development.

### 📂 Frontend
React application with TypeScript for a modern, interactive user interface.



 
### 📂 Backend
Express.js server with TypeScript for API handling, database management, and real-time updates.


---

## Tech Stack

### Frontend
- **React** with **TypeScript**
- **Tailwind CSS** for responsive UI
- **React Mapbox GL** for live map features
- **Axios** for HTTP requests

### Backend
- **Node.js** with **Express**
- **Mongoose** for MongoDB database
- **Socket.IO** for real-time communication
- **JWT** for secure authentication

### Database
- **MongoDB**: Storing user, booking, and fleet data.

---

## Installation

### Prerequisites
- **Node.js** (v16+)
- **MongoDB** instance (local or cloud)

# Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/PepelaJohn/ARIA.git
   cd ARIA```

2. Install dependencies:
  ## Backend
   ```bash
  cd backend && npm install
```

  ## Frontend
  ```bash
  cd ../frontend && npm install
```
3. Configure environment variables:
```.env
  MONGO_URI=your_mongo_uri
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```

4. Run the application:

  ## Backend
  ```bash
  cd backend && npm run dev
```
  ## Frontend
  ```bash
  cd ../frontend && npm start
```

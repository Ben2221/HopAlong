# HopAlong - Premium Campus Ride-Sharing Platform

HopAlong is a state-of-the-art ride-sharing application designed specifically for campus communities. It enables students and faculty to share rides, split costs fairly based on distance, and communicate in real-time, all within a secure and premium user interface.

## 🚀 Key Features

- **Real Road Routing**: Integration with **OSRM** for actual road-path visualization and distance-based fare estimation (replaces straight-line distance).
- **Dynamic "Join on the Way"**: During ride creation, the system automatically suggests existing rides that pass through your specific route, allowing you to hop in for just a portion of a trip.
- **Individual Segment Tracking**: Each rider has their own pickup and dropoff points tracked within a single journey, enabling precise distance-based fare splitting.
- **Peer-to-Peer Coordination**: Organizers can manage journey status (Start/Complete) directly, making the platform ideal for student-led carpooling without requiring a dedicated "Driver" role.
- **Real-Time Tracking**: Live map integration (Leaflet) showing driver and passenger locations in real-time.
- **Secure Communication**: Built-in chat system with emoji support and ride-specific rooms.
- **Safety First**: Dedicated **SOS Trigger** that alerts campus security and shares live trip details in emergencies.
- **Privacy Mode**: Users can choose to be anonymous, using randomly generated "Cool Adjective + Animal" pseudonyms.
- **Admin Dashboard**: Comprehensive control panel for managing users, monitoring rides, and broadcasting campus-wide alerts.

## 🛠 Tech Stack

### Frontend
- **React (Vite)**: For a fast, modern component-based UI.
- **Tailwind CSS**: For premium, responsive styling.
- **Motion (Framer Motion)**: For smooth micro-interactions and transitions.
- **Leaflet**: For interactive map and route visualization.
- **Socket.io Client**: For real-time updates and messaging.
- **Zustand**: For lightweight and efficient state management.

### Backend
- **Node.js & Express**: Robust server-side framework.
- **MongoDB & Mongoose**: Flexible NoSQL database for storing user, ride, and chat data.
- **Socket.io**: Powering real-time synchronization between users and drivers.
- **JWT (JSON Web Tokens)**: Secure authentication and authorization.
- **OSRM API**: For real road distance and geometry calculation.
- **Haversine Formula**: Reliable fallback for distance-based pricing on a sphere.

## 📦 Services Used
- **OSRM (Open Source Routing Machine)**: For real-world driving routes and distances.
- **Photon API (Komoot)**: For lightning-fast address autocomplete and geocoding.
- **OpenStreetMap**: Providing the map tiles for live tracking.

## 📂 Project Structure

- `client/`: React frontend application.
- `server/`: Node.js backend API and socket handlers.
- `server/src/models/`: Database schemas (User, Ride, Message, GlobalSettings).
- `server/src/controllers/`: Business logic for authentication and ride management.
- `server/src/sockets/`: Real-time event logic (GPS tracking, Chat, SOS).

## 🛡 Security & Safety
HopAlong implements a unique SOS system. When triggered, the platform:
1. Logs the exact ride ID and participating members.
2. Broadcasts an emergency alert to all connected administrators.
3. Notifies the ride-specific chat room to alert other passengers.

---
Developed with ❤️ for the Campus Community.

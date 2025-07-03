# Smart Agrofriend Backend 🌾

**Smart Agrofriend** is an intelligent backend system designed to support farmers and agriculture enthusiasts. It provides APIs for managing plant data, suggesting optimal crops, and storing user information securely. This backend powers the Smart Agrofriend platform — helping users make smarter, data-driven agricultural decisions.

## 🚀 Features

- 🤖 RESTful API built with **Node.js** and **Express**
- 🔐 Secure authentication (JWT-based)
- 🌱 MongoDB integration for storing plant, user, and farm data
- 🗂 Organized project structure:
  - `/controllers` – HTTP request handlers
  - `/routes` – API endpoints
  - `/schema` – Mongoose models
  - `/middleware` – Auth, validation, error-handling logic
- ⚙️ Environment configuration with `.env`
- 📦 Deployment-ready (e.g. Vercel)


## 📦 Tech Stack

- **Node.js** + **Express** – server framework
- **MongoDB** – database (via Mongoose)
- **JWT** – authentication tokens
- **dotenv** – environment variable management
- **Nodemon** – auto-reloading in development

---

## 🛠️ Installation & Setup

**Prerequisites**:
- Node.js (v14+)
- MongoDB instance (local or Atlas)

1. Clone the repo:

   ```bash
   git clone https://github.com/flutter-abhi/Smart_Agrofriend_backend.git
   cd Smart_Agrofriend_backend

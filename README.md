# Smart AgroFriend Backend

The backend system for the Smart AgroFriend project, which aims to connect farmers and laborers, provide agricultural equipment rental/purchase services, and offer future crop price predictions.

## Features

- **Labor-Farmer Connectivity**: 
  - Farmers can post job opportunities.
  - Laborers can view and apply for jobs.
  - Real-time chat for communication between farmers and laborers.

- **Rent or Buy Agricultural Equipment**: 
  - View and book agricultural equipment for rent or purchase.
  - Post equipment for rent/sale with detailed information and video verification.
  - Ratings and reviews for equipment and services.

- **Animal Buy or Sell**: 
  - Post ads for buying or selling animals.
  - Filter and search animals by various criteria.
  - Posts are auto-archived after a specific period.

- **Future Crop Price Prediction**: 
  - Predict future prices of crops using machine learning models (Linear Regression and LSTM).
  - Display the top 10 profitable crops based on predictions.

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT), bcrypt for password hashing
- **File Uploads**: Multer, Cloudinary for storing images and videos
- **Environment Variables**: Managed using `dotenv`
- **Real-time Communication**: Socket.IO for chat functionality
- **Machine Learning**: Models integrated for crop price prediction

## Getting Started

### Prerequisites

- Node.js
- MongoDB
- Cloudinary account for media storage

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart_agrofriend_backend.git

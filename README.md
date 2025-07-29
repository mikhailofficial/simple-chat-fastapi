# Real-Time Chat Application

A modern, real-time chat application built with React, FastAPI, and WebSocket technology. Features user authentication, real-time messaging, message deletion, and online user tracking.

## 🚀 Features

- **Real-time messaging** with WebSocket connections
- **User authentication** using Clerk
- **Message deletion** with proper state management
- **Online user tracking** and user list
- **Responsive design** with modern UI
- **Date headers** for message organization
- **System messages** for user join/leave notifications

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Clerk** - Authentication and user management
- **CSS Modules** - Scoped styling
- **WebSocket API** - Real-time communication

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Database ORM
- **PostgreSQL** - Primary database
- **WebSocket** - Real-time bidirectional communication
- **Uvicorn** - ASGI server
- **Python 3.13+** - Latest Python features

### Database
- **PostgreSQL** - Relational database
- **SQLAlchemy ORM** - Database abstraction layer

### Authentication
- **Clerk** - Complete authentication solution
- **JWT tokens** - Secure API authentication

## 📱 What the App Does

This is a real-time chat application that allows users to:

1. **Sign up/Sign in** using Clerk authentication
2. **Send messages** in real-time to all connected users
3. **Delete messages** with proper database persistence
4. **See online users** and track who's currently in the chat
5. **View message history** with organized date headers
6. **Receive system notifications** when users join/leave

The app provides a seamless chat experience with modern UI/UX, real-time updates, and proper state management.

## 🖼️ Screenshots



## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Python** (3.13 or higher)
- **PostgreSQL** database
- **Clerk account** for authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mikhailofficial/simple-chat-fastapi.git
   cd myfastapiapp
   ```

2. **Set up the Backend**
   ```bash
   cd backend
   
   # Create virtual environment
   python -m venv .venv
   
   # Activate virtual environment
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   
   # Install dependencies
   pip install uv
   uv sync
   
   # Create .env file
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   # Database Configuration
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=chat_app
   
   # Clerk Configuration
   CLERK_SECRET_KEY=your_clerk_secret_key
   JWT_KEY=your_jwt_key
   ```

4. **Set up the Frontend**
   ```bash
   cd ../frontend
   
   # Install dependencies
   npm install
   
   # Create .env file
   cp .env.example .env
   ```

5. **Configure Frontend Environment Variables**
   
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   ```

### Running the Application

1. **Start the Backend Server**
   ```bash
   cd backend
   source .venv/bin/activate  # or .venv\Scripts\activate on Windows
   python server.py
   ```
   
   The backend will run on `http://localhost:8000`

2. **Start the Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   ```
   
   The frontend will run on `http://localhost:5173`

3. **Access the Application**
   
   Open your browser and navigate to `http://localhost:5173`

### Database Setup

1. **Install PostgreSQL** if you haven't already
2. **Create a database**:
   ```sql
   CREATE DATABASE chat_app;
   ```
3. **Update the `.env` file** with your database credentials
4. **The tables will be created automatically** when you first run the application

## 🔧 Development

### Project Structure

```
myfastapiapp/
├── backend/
│   ├── src/
│   │   ├── app.py              # FastAPI application
│   │   ├── routes/
│   │   │   └── chat.py         # Chat API routes
│   │   ├── database/
│   │   │   ├── models.py       # SQLAlchemy models
│   │   │   └── db.py           # Database operations
│   │   └── utils.py            # Authentication utilities
│   ├── server.py               # Server entry point
│   └── pyproject.toml          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   └── config/             # Configuration files
│   └── package.json            # Node.js dependencies
└── README.md                   # This file
```

### Available Scripts

**Backend:**
- `python server.py` - Start the development server
- `uv sync` - Install/update dependencies

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Environment Variables

### Backend (.env)
```env
# Database
DB_USER=your_username
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chat_app

# Authentication
CLERK_SECRET_KEY=sk_test_...
JWT_KEY=your_jwt_key
```

### Frontend (.env)
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```
## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Authentication Issues**
   - Verify Clerk keys are correct
   - Check CORS settings
   - Ensure frontend and backend URLs match

3. **WebSocket Connection Failed**
   - Check if backend is running on port 8000
   - Verify WebSocket URL in frontend config
   - Check firewall settings

4. **Frontend Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility
   - Verify all environment variables are set

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Chatting! 🎉** 
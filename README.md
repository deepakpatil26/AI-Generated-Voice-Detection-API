# AI Voice Detection API - React & Node.js

A full-stack web application that detects whether a voice sample is AI-generated or spoken by a real human. Built with React frontend and Node.js/Express backend, supporting 5 languages: Tamil, English, Hindi, Malayalam, and Telugu.

## 🚀 Features

- **React Frontend**: Modern, responsive UI with Tailwind CSS
- **Node.js Backend**: Express API with TypeScript
- **AI Voice Detection**: Classify voice samples as AI-generated or human
- **Multi-language Support**: Tamil, English, Hindi, Malayalam, Telugu
- **Audio Upload**: Drag-and-drop MP3 file upload with validation
- **Real-time Processing**: Fast audio analysis with confidence scores
- **API Key Authentication**: Secure API access
- **Beautiful UI**: Modern design with animations and visual feedback

## 📋 Requirements

- Node.js 16+ and npm
- Modern web browser

## 🌐 Live Demo

- **Frontend**: [https://ai-voice-detection-api.netlify.app/](https://ai-voice-detection-api.netlify.app/)
- **Backend API**: [https://ai-voice-detection-api-5hv1.onrender.com](https://ai-voice-detection-api-5hv1.onrender.com)
- **API Documentation**: [https://ai-voice-detection-api-5hv1.onrender.com/](https://ai-voice-detection-api-5hv1.onrender.com/)

## 🛠️ Installation

### Backend Setup

1. **Navigate to server directory**

   ```bash
   cd server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:8000` (or your Render URL in production)

### Frontend Setup

1. **Navigate to client directory**

   ```bash
   cd client
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   # Create .env file in client directory
   echo "REACT_APP_API_URL=http://localhost:8000" > .env
   echo "REACT_APP_API_KEY=your-secret-api-key-change-in-production" >> .env
   ```

4. **Start the React app**
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000` (or your Netlify URL in production)

## 📚 API Documentation

### Endpoints

#### Voice Detection

```
POST /api/voice/detect
Headers: X-API-Key: your-api-key
Body: {
  "audioBase64": "base64_encoded_mp3_string",
  "language": "English"
}
```

#### Health Check

```
GET /api/health
```

#### API Info

```
GET /
```

## 🎨 UI Features

- **Drag & Drop Upload**: Intuitive file upload interface
- **Audio Preview**: Built-in audio player for uploaded files
- **Language Selection**: Choose from 5 supported languages
- **Real-time Results**: Visual confidence indicators
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop and mobile

## 🏗️ Project Structure

```
voice-detection-api/
├── server/                     # Node.js backend
│   ├── src/
│   │   ├── index.ts           # Express app entry point
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth and error handling
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   └── utils/             # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/          # API calls
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # Main app component
│   │   └── index.tsx          # Entry point
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🔧 Configuration

### Backend (.env)

```env
PORT=8000
API_KEY=your-secret-api-key-change-in-production
CORS_ORIGIN=http://localhost:3000
MAX_FILE_SIZE_MB=25
```

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_API_KEY=your-secret-api-key-change-in-production
```

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

### Frontend Tests

```bash
cd client
npm test
```

## 📦 Deployment

### Backend Deployment (Render.com) ✅ Live

**URL**: `https://ai-voice-detection-api-5hv1.onrender.com`

1. Push code to GitHub
2. Connect repository to Render.com
3. Set environment variables in Render dashboard
4. Deploy automatically

### Frontend Deployment (Netlify) ✅ Live

**URL**: `https://ai-voice-detection-api.netlify.app/`

1. Build the React app:
   ```bash
   cd client
   npm run build
   ```
2. Deploy to Netlify
3. Set environment variables (`REACT_APP_API_URL`, `REACT_APP_API_KEY`)

## 🔒 Security Features

- API key authentication
- Input validation and sanitization
- File type and size validation
- CORS configuration
- Rate limiting
- Error handling and logging

## 📊 Performance

- Fast audio processing (< 2 seconds)
- Support for files up to 25MB
- Optimized React components
- Efficient Node.js backend
- Minimal bundle size

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure frontend URL is in backend CORS whitelist
2. **API Key Errors**: Check API key in both frontend and backend .env files
3. **File Upload Errors**: Verify file is MP3 format and under 25MB
4. **Connection Errors**: Ensure both servers are running on correct ports

### Development Tips

- Use browser dev tools to inspect network requests
- Check console logs for detailed error messages
- Verify environment variables are set correctly
- Ensure Node.js version is 16 or higher

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check the documentation
- Review the test cases

---

**Tech Stack:**

- Frontend: React 18, TypeScript, Tailwind CSS, Lucide Icons
- Backend: Node.js, Express, TypeScript, Winston
- Tools: Axios, React Dropzone, Joi Validation

**Deadline**: February 5, 2026, 11:59:00 PM  
**Time Available**: 12 days from January 24, 2026

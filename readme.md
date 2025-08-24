# 🏍️ Revolt Motors Voice Chat Assistant

A real-time conversational voice interface built with the Gemini Live API, replicating advanced voice chat functionality for Revolt Motors - India's leading electric motorcycle company.

## ✨ Features

- **Real-time Voice Conversations**: Natural, low-latency voice interactions
- **Interruption Support**: Users can interrupt the AI mid-response
- **WebSocket Communication**: Server-to-server architecture for optimal performance
- **Responsive UI**: Clean, modern interface with visual feedback
- **Revolt Motors Focused**: AI trained specifically on Revolt Motors information
- **Multi-language Support**: Powered by Gemini's multilingual capabilities

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Google AI Studio API key
- Modern web browser with microphone access

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd revolt-motors-voice-chat
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Google API key
GOOGLE_API_KEY=your_actual_api_key_here
```

### 3. Get Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com)
2. Create a free account
3. Generate an API key
4. Copy it to your `.env` file

### 4. Run the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

### 5. Access the App

Open your browser and navigate to:
```
http://localhost:3000
```
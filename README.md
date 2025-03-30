# T.I.M.E Machine - Group Chat with Historical Figures

This application allows you to chat with simulated historical figures including Albert Einstein, Marilyn Monroe, and Alan Turing, either individually or in a group chat format.

## Setup Instructions

### 1. Get a Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 2. Set Environment Variables

Create a `.env` file in the project root with the following content:

```
GEMINI_API_KEY=your_api_key_here
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Backend Server

```bash
python app.py
```

The Flask server will start on port 5000.

### 5. Run the Frontend

```bash
cd frontend
npm install
npm start
```

The React frontend will start on port 3000.

## Features

- Chat with individual historical figures
- Create group chats with multiple historical figures
- Responses simulate the personality and knowledge of each character
- Interactive and responsive UI

## Architecture

- Frontend: React.js with a clean, intuitive interface
- Backend: Flask API server
- AI: Google Gemini 1.5 Pro model for generating responses

## Notes

- All conversations are simulated and for entertainment purposes
- The application uses the Gemini API to generate responses in the style of the historical figures
- Each agent has a unique prompt designed to capture their personality and knowledge

## Screenshots

(Screenshots will be added later)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/T.I.M.E-Machine.git
cd T.I.M.E-Machine
```

2. Install dependencies:
```bash
npm install
```

3. Set up Gemini API (optional):
   - Get an API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a `.env` file in the root directory with:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```

4. Start the development server:
```bash
npm start
```

## Connecting to Gemini API

This application is designed to work with Google's Gemini API. By default, it will use mock responses if the API is not configured.

To enable Gemini API:
1. Get an API key from Google AI Studio
2. Add your key to the `.env` file
3. The app will automatically switch from mock responses to using the real API

## Project Structure

```
src/
├── components/       # React components
│   ├── Sidebar.js    # Character list sidebar
│   ├── ChatHeader.js # Conversation header
│   ├── MessageList.js # Message display area
│   └── MessageInput.js # Input component
├── services/         # Business logic and API services
│   ├── chatService.js # Chat operations and storage
│   └── geminiService.js # Gemini API integration
├── utils/            # Utility functions and constants
│   └── agentData.js  # Historical figure data
├── App.js            # Main application component
└── index.js          # Application entry point
```

## Technologies Used

- React
- JavaScript
- CSS (Tailwind-like utilities)
- localStorage for persistence
- Google Gemini API (optional)

## Future Improvements

- Add user settings and preferences
- Implement additional historical figures
- Add message search functionality
- Enable image sharing and rich media in conversations

## License

MIT

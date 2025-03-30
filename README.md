# T.I.M.E Machine

A chat application that allows you to interact with historical figures using AI.

## Setup

### Frontend (React)
1. Change Folder
   ```bash
   cd frontend
   ```
3.  Install Node.js dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm start
```

### Backend (Python)

1. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the root directory with your OpenAI API key:
```
OPENAI_API_KEY=your_api_key_here
```

4. Start the Flask server:
```bash
python app.py
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select a historical figure to chat with
3. Start a conversation!

## Features

- Chat with various historical figures
- Persistent conversation history
- Real-time responses using OpenAI's GPT model
- Fallback to mock responses if the backend is unavailable

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

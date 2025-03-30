# T.I.M.E Machine - Chat with Historical Figures

A Discord-style chat interface that lets you converse with AI versions of historical figures.

## Features

- Discord-like UI with character list in the sidebar
- Individual conversations with each historical figure
- Persistent chat history using localStorage
- Modular architecture ready for Gemini API integration
- Responsive design

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

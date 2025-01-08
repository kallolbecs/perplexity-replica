# AI Search Assistant

An advanced open-source conversational AI search engine that delivers intelligent, context-aware search experiences with comprehensive real-time web browsing capabilities. Built with Google Gemini Flash 2.0 and Tavily for accurate, up-to-date information retrieval and citation.

## Features

- 🔍 Conversational AI search powered by Google Gemini Flash 2.0
- 🌐 Real-time web content retrieval via Tavily
- 📚 Comprehensive source citations and references
- 🎨 Beautiful, responsive UI with light/dark mode
- 💡 Context-aware responses with detailed analysis
- 📱 Mobile-friendly design

## Tech Stack

- Frontend: React.js with TypeScript
- UI Components: shadcn/ui + Tailwind CSS
- Backend: Node.js with Express
- Search: Tavily API
- LLM: Google Gemini Flash 2.0

## Prerequisites

Before you begin, ensure you have:
- Node.js 20.x or later installed
- API keys for:
  - Google Gemini (for LLM capabilities)
  - Tavily (for web search)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ai-search-assistant.git
cd ai-search-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your API keys:
```env
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
```

## Development

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Building for Production

To create a production build:

```bash
npm run build
npm start
```

## Project Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── lib/         # Utilities and store
│   │   └── App.tsx      # Main application component
├── server/               # Backend Express server
│   ├── services/        # API service integrations
│   └── routes.ts        # API routes
└── public/              # Static assets
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Credits

- Created by [@Kallol](https://www.linkedin.com/in/kallol-halder-195592b/)
- Powered by Google Gemini Flash 2.0 and Tavily API

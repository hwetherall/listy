# Listy

Listy is a React application that helps you create short, consensus-based lists from multiple Large Language Models. It queries various LLMs through OpenRouter and finds the most frequently occurring items.

## Features

- Query multiple LLMs simultaneously
- Normalize results to identify duplicates and variations (e.g., "Meta" and "Facebook")
- Extract the most frequent items across all models
- Display results in a copyable table format

## Tech Stack

- React (Frontend)
- OpenRouter API (LLM access)
- Deployed on Vercel

## LLM Models Used

- deepseek/deepseek-chat-v3-0324:free
- openai/gpt-4o-search-preview
- anthropic/claude-3.7-sonnet
- x-ai/grok-2-1212
- cohere/command-r7b-12-2024
- mistralai/mistral-small-3.1-24b-instruct:free
- nvidia/llama-3.1-nemotron-70b-instruct:free
- perplexity/sonar-pro
- google/gemma-3-27b-it

## Getting Started

### Prerequisites

- Node.js (v16+)
- An OpenRouter API key

### Installation

1. Clone this repository
   ```
   git clone https://github.com/yourusername/listy-app.git
   cd listy-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a `.env` file based on `.env.template` and add your OpenRouter API key
   ```
   cp .env.template .env
   ```
   
   Then edit the `.env` file to add your API key:
   ```
   REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. Start the development server
   ```
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view the app in your browser

## How to Use

1. Enter your query in the "Find things similar to" field
2. Set the "Long List Count" (how many items each LLM will return)
3. Set the "Short List Count" (how many of the most frequent items to show in final results)
4. Click "Submit" to query the LLMs
5. Once the raw results are collected, click "Normalize Results"
6. View the final results table and click "Copy to Clipboard" to use in spreadsheets

## Deployment

This app is designed to be deployed on Vercel:

```
npm install -g vercel
vercel
```

Make sure to set the `REACT_APP_OPENROUTER_API_KEY` environment variable in your Vercel project settings.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
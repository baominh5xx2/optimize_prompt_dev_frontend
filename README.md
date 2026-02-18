
# DevPrompt Optimizer Frontend

A modern dashboard for AI-powered prompt engineering, built with React Router v7 and Tailwind CSS v4.

## Features

- 🎨 **Dark Mode Dashboard**: Inspired by IDE aesthetics.
- ⚡️ **Optimized UI**: Split view for Context and Chat.
- 🔒 **TypeScript**: Fully typed codebase.
- 🎉 **TailwindCSS**: Custom theme configuration.

## Getting Started

### Installation

```bash
bun install
```

### Development

Start the development server:

```bash
bun dev
```

Your application will be available at `http://localhost:5173`.

## Project Structure

- `app/routes/home.tsx`: Main dashboard layout.
- `app/components/Layout`: Sidebar and Header components.
- `app/components/Dashboard`: KnowledgeBase and Chat components.
- `app/app.css`: Global styles and font configurations.

## Integration

Currently runs as a standalone UI. To connect with the Python backend, update the `ChatInterface` component to fetch from `http://localhost:8000/api/v1/agent/chat`.

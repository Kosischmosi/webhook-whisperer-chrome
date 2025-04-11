
# Webhook Whisperer - Chrome Extension

## Overview
Webhook Whisperer is a Chrome extension that helps you manage webhook URLs and secrets for multiple integrators. Keep all your webhook configurations in one secure place with easy access and management.

## Features
- Add, edit, and delete webhook configurations
- Store webhook URLs and secrets securely 
- Copy webhook details to clipboard with a single click
- Search through your webhook configurations
- Works both as a Chrome extension and as a standalone web application

## Installation

### Local Development
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server
4. Open your browser at http://localhost:8080

### Load as Chrome Extension
1. Build the project: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top right
4. Click "Load unpacked" and select the `dist` folder from this project
5. The extension will appear in your Chrome toolbar

## Usage
1. Click on the Webhook Whisperer icon in your Chrome toolbar
2. Use the "Add New Webhook" button to create a new webhook configuration
3. Fill in the webhook name, URL, and optional secret
4. Your webhooks will be securely stored in Chrome's storage

## Security
Your webhook data is stored locally in your browser using Chrome's storage API, which means:
- Data never leaves your browser
- No external servers are involved
- Your secrets remain private

## Technologies Used
- React
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Chrome Storage API

## License
MIT

# Web Studio Modern

A landing page originally built during a web development course — taken off the shelf a year later and modernized with a custom Node.js backend, MongoDB persistence, and Telegram bot notifications.

## Features

### Frontend

- **Smooth navigation** — clicking menu links (Studio, Portfolio, Contacts) scrolls to the section and animates the active underline indicator
- **Modal contact form** — "Order Service" button opens a modal where visitors fill in their details
- **Newsletter subscription** — email input in the footer sends the address to the database
- **Social media links** — footer icons link to real profiles (GitHub etc.)

### Backend

- **Contact form API** — validates and saves every request, then sends a Telegram notification
- **Newsletter API** — stores subscriber emails with duplicate detection
- **Telegram Bot** — new leads arrive instantly in a Telegram chat with an inline button to open a conversation with the client
- **MongoDB Atlas** — persists all requests and subscribers
- **Static file server** — serves the frontend with no framework or bundler
- **Zero runtime dependencies** (except Mongoose) — built entirely on Node.js built-ins

## Tech Stack

| Layer         | Technology               |
| ------------- | ------------------------ |
| Runtime       | Node.js 20+ (ESM)        |
| Database      | MongoDB Atlas + Mongoose |
| Notifications | Telegram Bot API         |
| Frontend      | HTML, CSS, JavaScript    |
| Server        | Node.js `http` module    |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mikosid/web-studio-modern.git
cd web-studio-modern
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root directory:

```env
PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here
MONGO_URI=your_mongodb_connection_string_here
```

| Variable             | Description                                     |
| -------------------- | ----------------------------------------------- |
| `PORT`               | Port the server listens on (default: `3000`)    |
| `TELEGRAM_BOT_TOKEN` | Token from [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID`   | ID of the chat where notifications are sent     |
| `MONGO_URI`          | MongoDB Atlas connection string                 |

### 4. Run the server

```bash
# Production
npm start

# Development (auto-restart on file changes)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Endpoints

### `POST /api/requests`

Saves a contact request and sends a Telegram notification.

**Request body:**

```json
{
  "name": "Anna",
  "phone": "+380969100648",
  "email": "anna@example.com",
  "comment": "I need a landing page",
  "privacyAccepted": true
}
```

**Response `201`** — request saved and Telegram notification sent  
**Response `202`** — request saved, Telegram notification failed  
**Response `400`** — validation errors

---

### `POST /api/subscribers`

Saves a newsletter subscriber email.

**Request body:**

```json
{
  "email": "anna@example.com"
}
```

**Response `201`** — subscribed successfully  
**Response `409`** — email already subscribed

## Project Structure

```
web-studio-modern/
├── server.js          # Backend — HTTP server, API, Telegram, MongoDB
├── index.html         # Landing page
├── .env               # Environment variables (not committed)
├── .env.example       # Environment variable template
└── package.json
```

## What I Modernized

This project was originally a static HTML/CSS layout from a web development course. A year later I came back to it and independently added:

- Node.js HTTP server with a REST API — no Express or any framework
- JavaScript interactivity — animated nav indicator, modal window, form handling
- MongoDB Atlas integration with Mongoose for data persistence
- Telegram Bot with inline keyboard buttons for instant lead notifications
- Newsletter subscription endpoint with duplicate detection
- Input validation and HTML escaping to prevent XSS
- Path traversal protection for static file serving

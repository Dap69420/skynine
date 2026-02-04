# Sky9 Demo Submission System

A professional demo submission form with Discord webhook integration.

## Setup Instructions

### 1. Install Node.js
If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies
Open PowerShell in this directory and run:
```powershell
npm install
```

### 3. Configure Discord Webhook
1. Go to your Discord server
2. Navigate to **Server Settings** > **Integrations** > **Webhooks**
3. Click **New Webhook** or **Create Webhook**
4. Customize the webhook name (e.g., "Sky9 Submissions")
5. Select the channel where submissions should appear
6. Copy the **Webhook URL**
7. Open the `.env` file and replace `your_discord_webhook_url_here` with your actual webhook URL

Example `.env` file:
```
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1234567890/abcdefghijklmnop
PORT=3000
```

### 4. Start the Server
Run the server with:
```powershell
npm start
```

The server will start on `http://localhost:3000`

### 5. Access the Form
Open your browser and go to:
```
http://localhost:3000/index (8).html
```

## Features

✅ Multi-step submission form with progress bar
✅ Dynamic artist management
✅ Discord webhook integration with rich embeds
✅ Unique demo code generation (DEMO-XXXX-XXXX)
✅ Beautiful UI with animations
✅ Mobile responsive
✅ Secure backend (webhook URL hidden from frontend)

## Discord Embed Preview

Submissions will appear in Discord with:
- 🎫 Submission Code
- 💿 Release Title & Version
- 👨‍🎤 Artists (with Spotify links if provided)
- 🔗 Demo Link
- 📧 Contact Email
- 💬 Additional Message (if provided)
- ⏰ Timestamp

## Troubleshooting

**Server won't start:**
- Make sure Node.js is installed
- Run `npm install` to install dependencies
- Check if port 3000 is already in use

**Submissions not appearing in Discord:**
- Verify your webhook URL is correct in `.env`
- Make sure the webhook hasn't been deleted in Discord
- Check the server console for error messages

**Form submission fails:**
- Make sure the server is running
- Check browser console for errors
- Verify all required fields are filled

## File Structure

```
sky9/
├── index (8).html      # Frontend form
├── server.js           # Backend API server
├── package.json        # Node.js dependencies
├── .env               # Configuration (webhook URL)
├── .gitignore         # Git ignore file
├── logo.png           # Your logo
└── README.md          # This file
```

## Support

For issues or questions, contact: support@sky9.fr

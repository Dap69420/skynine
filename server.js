const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Root route to serve index.html
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Generate unique demo code
function generateDemoCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'DEMO-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Submission endpoint
app.post('/api/submit', async (req, res) => {
  try {
    const { releaseTitle, releaseVersion, artists, demoLink, message, email } = req.body;

    // Validate required fields
    if (!releaseTitle || !artists || artists.length === 0 || !demoLink || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate demo code
    const demoCode = generateDemoCode();

    // Build Discord embed
    const artistsText = artists.map((artist, i) => {
      let text = `**${i + 1}. ${artist.name}**`;
      if (artist.spotify) {
        text += `\n   🎵 [Spotify Link](${artist.spotify})`;
      }
      return text;
    }).join('\n');

    const embed = {
      title: '🎵 New Demo Submission',
      color: 0x4db8ff, // Sky blue color
      fields: [
        {
          name: '🎫 Submission Code',
          value: `\`${demoCode}\``,
          inline: false
        },
        {
          name: '💿 Release Title',
          value: releaseTitle,
          inline: true
        },
        {
          name: '🎼 Release Version',
          value: releaseVersion,
          inline: true
        },
        {
          name: '👨‍🎤 Artists',
          value: artistsText || 'None',
          inline: false
        },
        {
          name: '🔗 Demo Link',
          value: `[Listen Here](${demoLink})`,
          inline: false
        },
        {
          name: '📧 Contact Email',
          value: email,
          inline: false
        }
      ],
      timestamp: new Date().toISOString(),
      footer: {
        text: 'Sky9 Submission System'
      }
    };

    // Add message if provided
    if (message && message.trim()) {
      embed.fields.push({
        name: '💬 Additional Message',
        value: message,
        inline: false
      });
    }

    // Send to Discord webhook
    const webhookURL = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookURL) {
      console.error('Discord webhook URL not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const discordResponse = await fetch(webhookURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'Sky9 Submissions',
        avatar_url: 'https://i.imgur.com/GKUBgxB.png',
        embeds: [embed]
      })
    });

    if (!discordResponse.ok) {
      throw new Error(`Discord webhook failed: ${discordResponse.statusText}`);
    }

    // Return success with demo code
    res.json({
      success: true,
      demoCode: demoCode,
      message: 'Submission received successfully'
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({ 
      error: 'Failed to process submission',
      details: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Sky9 Submission Server running on http://localhost:${PORT}`);
});

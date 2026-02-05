require('dotenv').config();

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

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { releaseTitle, artists, demoLink, message, email } = req.body;

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
      description: `New demo submission received for review`,
      color: 0x4db8ff,
      fields: [
        {
          name: '🎫 Submission Code',
          value: `\`${demoCode}\``,
          inline: false
        },
        {
          name: '━━━━━━━━━━━━━━━━━',
          value: '\u200b',
          inline: false
        },
        {
          name: '💿 Release Title',
          value: releaseTitle,
          inline: false
        },
        {
          name: '👨‍🎤 Artists',
          value: artistsText || 'None',
          inline: false
        },
        {
          name: '━━━━━━━━━━━━━━━━━',
          value: '\u200b',
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
    return res.status(200).json({
      success: true,
      demoCode: demoCode,
      message: 'Submission received successfully'
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    return res.status(500).json({ 
      error: 'Failed to process submission',
      details: error.message 
    });
  }
};

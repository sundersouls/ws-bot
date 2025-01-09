const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  console.log('Scan this QR code to login:');
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp bot is ready!');
});

app.post('/send-code', async (req, res) => {
  const { number, code } = req.body;

  if (!number || !code) {
    return res.status(400).json({ error: 'Number and code are required' });
  }

  try {
    const formattedNumber = number.includes('@c.us') ? number : `${number}@c.us`; 
    const message = `Your verification code is: ${code}`;

    await client.sendMessage(formattedNumber, message);
    res.status(200).json({ success: true, message: 'Code sent successfully!' });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, error: 'Failed to send message' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

client.initialize();

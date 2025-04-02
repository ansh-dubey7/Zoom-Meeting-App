const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const axios = require('axios');

router.post('/register', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = new User({ email, password, role });
    await user.save();
    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(400).json({ message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token });
});

router.get('/zoom', (req, res) => {
  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.ZOOM_CLIENT_ID}&redirect_uri=${process.env.ZOOM_REDIRECT_URI}`;
  res.json({ url: authUrl });
});

router.get('/zoom/callback', async (req, res) => {
  const { code } = req.query;
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Get JWT from header

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  try {
    // Verify JWT to get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Exchange code for Zoom access token
    const response = await axios.post('https://zoom.us/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI,
      },
      auth: {
        username: process.env.ZOOM_CLIENT_ID,
        password: process.env.ZOOM_CLIENT_SECRET,
      },
    });

    const { access_token } = response.data;
    // Save the Zoom access token to the user
    user.zoomAccessToken = access_token;
    await user.save();

    res.json({ access_token }); // Optional: return for debugging
  } catch (err) {
    console.error('Zoom auth error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Zoom auth failed', error: err.response?.data || err.message });
  }
});

module.exports = router;
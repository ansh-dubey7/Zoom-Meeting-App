const express = require('express');
const router = express.Router();
const axios = require('axios');
const Meeting = require('../models/Meeting.js');
const auth = require('../middleware/auth.js');

router.post('/create', auth, async (req, res) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    console.log('User:', req.user);
    if (!req.user.zoomAccessToken) {
      throw new Error('Zoom access token is missing');
    }

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: 'New Meeting',
        type: 2,
        settings: { host_video: true, participant_video: true },
      },
      {
        headers: {
          Authorization: `Bearer ${req.user.zoomAccessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Zoom API response:', response.data);

    const meeting = new Meeting({
      meetingId: response.data.id,
      startUrl: response.data.start_url,
      joinUrl: response.data.join_url,
      instructor: req.user.id,
    });
    await meeting.save();
    res.json({ startUrl: meeting.startUrl, meetingId: meeting.meetingId });
  } catch (err) {
    const errorDetails = err.response ? err.response.data : err.message;
    console.error('Error creating meeting:', errorDetails);
    res.status(500).json({ message: 'Error creating meeting', error: errorDetails });
  }
});

router.get('/', auth, async (req, res) => {
  const meetings = req.user.role === 'instructor'
    ? await Meeting.find({ instructor: req.user.id })
    : await Meeting.find();
  res.json(meetings);
});

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const axios = require('axios');
// const Meeting = require('../models/Meeting.js');
// const auth = require('../middleware/auth.js');

// router.post('/create', auth, async (req, res) => {
//   if (req.user.role !== 'instructor') return res.status(403).json({ message: 'Unauthorized' });

//   try {
//     const response = await axios.post(
//       'https://api.zoom.us/v2/users/me/meetings',
//       {
//         topic: 'New Meeting',
//         type: 2, // Scheduled meeting
//         settings: { host_video: true, participant_video: true },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${req.user.zoomAccessToken}`, // Assume token is stored in user
//           'Content-Type': 'application/json',
//         },
//       }
//     );

//     const meeting = new Meeting({
//       meetingId: response.data.id,
//       startUrl: response.data.start_url,
//       joinUrl: response.data.join_url,
//       instructor: req.user.id,
//     });
//     await meeting.save();
//     res.json({ startUrl: meeting.startUrl, meetingId: meeting.meetingId });
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating meeting' });
//   }
// });

// router.get('/', auth, async (req, res) => {
//   const meetings = req.user.role === 'instructor'
//     ? await Meeting.find({ instructor: req.user.id })
//     : await Meeting.find();
//   res.json(meetings);
// });

// module.exports = router;
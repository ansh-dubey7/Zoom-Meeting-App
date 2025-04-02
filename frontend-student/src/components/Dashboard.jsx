import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      const { data } = await axios.get('http://localhost:5000/api/meetings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMeetings(data);
    };
    fetchMeetings();
  }, []);

  const joinMeeting = (joinUrl) => {
    window.location.href = joinUrl;
  };

  return (
    <div>
      <h2>Student Dashboard</h2>
      <h3>Live Meetings</h3>
      <ul>
        {meetings.map(meeting => (
          <li key={meeting.meetingId}>
            {meeting.meetingId} - <button onClick={() => joinMeeting(meeting.joinUrl)}>Join Now</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
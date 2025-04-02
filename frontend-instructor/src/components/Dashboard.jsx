import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/meetings', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setMeetings(data);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      }
    };
    fetchMeetings();
  }, []);

  const createMeeting = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }
      console.log('Sending request with token:', token);

      const { data } = await axios.post(
        'http://localhost:5000/api/meetings/create',
        {}, // Add payload if backend requires it
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Meeting created:', data);
      window.location.href = data.startUrl;
    } catch (error) {
      console.error('Error creating meeting:', error.response?.data || error.message);
      alert(`Failed to create meeting: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div>
      <h2>Instructor Dashboard</h2>
      <button onClick={createMeeting}>Create Meeting</button>
      <h3>Past Meetings</h3>
      <ul>
        {meetings.map(meeting => (
          <li key={meeting.meetingId}>
            {meeting.meetingId} - {new Date(meeting.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const Dashboard = () => {
//   const [meetings, setMeetings] = useState([]);

//   useEffect(() => {
//     const fetchMeetings = async () => {
//       const { data } = await axios.get('http://localhost:5000/api/meetings', {
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
//       });
//       setMeetings(data);
//     };
//     fetchMeetings();
//   }, []);

//   const createMeeting = async () => {
//     const { data } = await axios.post(
//       'http://localhost:5000/api/meetings/create',
//       {},
//       { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//     );
//     window.location.href = data.startUrl;
//   };

//   return (
//     <div>
//       <h2>Instructor Dashboard</h2>
//       <button onClick={createMeeting}>Create Meeting</button>
//       <h3>Past Meetings</h3>
//       <ul>
//         {meetings.map(meeting => (
//           <li key={meeting.meetingId}>{meeting.meetingId} - {new Date(meeting.createdAt).toLocaleString()}</li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Dashboard;
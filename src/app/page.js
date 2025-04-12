// app/page.js
"use client";  // Make this a Client Component so we can use hooks

import { useState, useEffect } from 'react';

export default function Home() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        setLogs(data.logs);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ padding: '1rem' }}>
      <h1>Suricata Alert Summaries</h1>
      {logs.length > 0 ? (
        <ul>
          {logs.map((log, i) => <li key={i}>{log}</li>)}
        </ul>
      ) : (
        <p>No alerts yet.</p>
      )}
    </main>
  );
}

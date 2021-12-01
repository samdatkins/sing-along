import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

const chatSocket = new WebSocket("ws://localhost:8000/ws/test/");

function App() {
  const [song, setSong] = useState<string>();
  useEffect(() => {
    chatSocket.onopen = () => {
      console.log("WebSocket Client Connected");
      chatSocket.send(JSON.stringify({ type: "getSong" }));
    };

    chatSocket.onmessage = (message) => {
      const jsonData = JSON.parse(message.data);
      if (jsonData.song !== undefined) {
        setSong(jsonData.song);
      } else {
        console.error("no song found!");
      }
    };

    return function cleanup() {
      chatSocket.close();
    };
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <p>Song: {song}</p>
      </header>
    </div>
  );
}

export default App;

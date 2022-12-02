import axios from "axios";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [song, setSong] = useState<string>();
  useEffect(() => {
    async function getTest() {
      const test = await axios.get("/api/test");
      setSong(test.data.msg);
    }
    getTest();
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

import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddSongView from "./components/AddSongView";
import CurrentSongView from "./components/CurrentSongView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CurrentSongView />} />
        <Route path="addSong" element={<AddSongView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

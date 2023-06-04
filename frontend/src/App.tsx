import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AddSongDrawer from "./components/AddSongDrawer";
import CurrentSongView from "./components/CurrentSongView";
import SongbookList from "./components/SongbookList";
import WelcomePage from "./components/WelcomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/live/:sessionKey/" element={<CurrentSongView />}>
          <Route path="add-song" element={<AddSongDrawer />} />
        </Route>
        <Route path="/live/:sessionKey/list" element={<SongbookList />} />
        <Route path="/live" element={<WelcomePage />} />
        <Route path="/" element={<Navigate to="/live" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

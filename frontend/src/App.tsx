import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddSongView from "./components/AddSongView";
import CurrentSongView from "./components/CurrentSongView";
import cookie from "react-cookies";
import axios from "axios";
import { createCSRF } from "./helpers/session";

const randomCSRF = createCSRF();
axios.defaults.headers.common["X-CSRFTOKEN"] = randomCSRF;
cookie.save("csrftoken", randomCSRF, { path: "/" });

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/live/:sessionKey/" element={<CurrentSongView />} />
        <Route path="/live/:sessionKey/addSong" element={<AddSongView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

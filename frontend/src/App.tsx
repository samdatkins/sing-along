import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddSongView from "./components/AddSongView";
import CurrentSongView from "./components/CurrentSongView";
import cookie from "react-cookies";
import axios from "axios";

const fakeCSRF =
  "t6ZDAgnh4ALjSseiLRumF9cLjgxMWNb8fYSBIwGyKQRPWfhVN0hA7xL0COrpmMcH";
axios.defaults.headers.common["X-CSRFTOKEN"] = fakeCSRF;
cookie.save("csrftoken", fakeCSRF, { path: "/" });

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

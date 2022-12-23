import axios from "axios";
import cookie from "react-cookies";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddSongDrawer from "./components/AddSongDrawer";
import CurrentSongView from "./components/CurrentSongView";
import WelcomePage from "./components/WelcomePage";
import { createCSRF } from "./helpers/session";

const randomCSRF = createCSRF();
axios.defaults.headers.common["X-CSRFTOKEN"] = randomCSRF;
cookie.save("csrftoken", randomCSRF, { path: "/" });

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/live/:sessionKey/" element={<CurrentSongView />}>
          <Route path="addSong" element={<AddSongDrawer />} />
        </Route>
        <Route path="/" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

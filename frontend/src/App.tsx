import axios from "axios";
import cookie from "react-cookies";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AddSongDrawer from "./components/AddSongDrawer";
import CreateNewSongbook from "./components/CreateNewSongbook";
import CurrentSongView from "./components/CurrentSongView";
import SongbookList from "./components/SongbookList";
import UserProfile from "./components/UserProfile";
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
          <Route path="add-song" element={<AddSongDrawer />} />
        </Route>
        <Route path="/live/profile" element={<UserProfile />} />
        <Route path="/live/createsongbook" element={<CreateNewSongbook />} />
        <Route path="/live/:sessionKey/list" element={<SongbookList />} />
        <Route path="/live" element={<WelcomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { useAsync } from "react-async-hook";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AddSongModal from "./components/AddSongModal";
import CurrentSongView from "./components/CurrentSongView";
import SongbookList from "./components/SongbookList";
import WelcomePage from "./components/WelcomePage";
import { getUserDetails } from "./services/songs";

function App() {
  const asyncUser = useAsync(getUserDetails, [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/live/:sessionKey/"
          element={<CurrentSongView asyncUser={asyncUser} />}
        >
          <Route path="add-song" element={<AddSongModal />} />
        </Route>
        <Route path="/live/:sessionKey/list" element={<SongbookList />} />
        <Route path="/live" element={<WelcomePage asyncUser={asyncUser} />} />
        <Route path="/" element={<Navigate to="/live" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

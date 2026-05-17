import { useAsync } from "react-async-hook";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AddSongPage from "./components/AddSongPage";
import CurrentSongView from "./components/CurrentSongView";
import WelcomePage from "./components/WelcomePage";
import { getAllSongbooks, getUserDetails } from "./services/songs";
import SongbookPreview from "./components/SongbookPreview";

function App() {
  const asyncUser = useAsync(getUserDetails, [], {
    setLoading: (state) => ({ ...state, loading: true }),
  });
  const asyncSongbooks = useAsync(async () => getAllSongbooks(), []);
  const songbooks = asyncSongbooks.result?.data.results;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/live/:sessionKey/"
          element={<CurrentSongView asyncUser={asyncUser} />}
        />
        <Route path="/live/:sessionKey/preview" element={<SongbookPreview />} />
        <Route path="/live/:sessionKey/add-song" element={<AddSongPage />} />
        <Route
          path="/live/"
          element={<WelcomePage asyncUser={asyncUser} songbooks={songbooks} />}
        />
        <Route path="/" element={<Navigate to="/live" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

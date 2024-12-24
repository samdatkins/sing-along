import { useAsync } from "react-async-hook";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AddSongPage from "./components/AddSongPage";
import CurrentSongView from "./components/CurrentSongView";
import ViewAllSongbooks from "./components/ViewAllSongbooks";
import WelcomePage from "./components/WelcomePage";
import WishlistForm from "./components/WishlistForm";
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
        >
          <Route index element={<WishlistForm />} />
          <Route
            path="songbooks"
            element={<ViewAllSongbooks is_noodle={true} />}
          />
          <Route
            path="sing-alongs"
            element={<ViewAllSongbooks is_noodle={false} />}
          />
        </Route>
        <Route path="/" element={<Navigate to="/live" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

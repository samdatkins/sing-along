import { useAsync } from "react-async-hook";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AddSongPage from "./components/AddSongPage";
import CurrentSongView from "./components/CurrentSongView";
import ViewAllSongbooks from "./components/ViewAllSongbooks";
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
        />
        <Route path="/live/:sessionKey/add-song" element={<AddSongPage />} />
        <Route
          path="/live/songbooks/:is_noodle"
          element={<ViewAllSongbooks />}
        />
        <Route path="/live" element={<WelcomePage asyncUser={asyncUser} />} />
        <Route path="/" element={<Navigate to="/live" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

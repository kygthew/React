import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import Home from "./pages/Home";
import Workouts from "./pages/Workouts";
import ExerciseDetails from "./pages/ExerciseDetails";
import About from "./pages/About";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />

        {}
        <Route element={<GuestRoute />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>

        {}
        <Route element={<ProtectedRoute />}>
          <Route path="workouts" element={<Workouts />} />
          <Route path="workouts/:id" element={<ExerciseDetails />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

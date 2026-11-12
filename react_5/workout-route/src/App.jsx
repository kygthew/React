import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Dashboard from "./components/dashboard";
import ExerciseDetails from "./pages/ExerciseDetails";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import "./App.css";

const initialExercises = [
  { id: 1, name: "Bench Press", muscle: "Chest", sets: 4, status: "Planned", resetKey: 0 },
  { id: 2, name: "Squats", muscle: "Legs", sets: 3, status: "In Progress", resetKey: 0 },
  { id: 3, name: "Pull Ups", muscle: "Back", sets: 3, status: "Completed", resetKey: 0 },
];

function App() {
  const [exercises, setExercises] = useState(initialExercises);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home exercises={exercises} />} />
        <Route
          path="workouts"
          element={<Dashboard exercises={exercises} setExercises={setExercises} />}
        />
        <Route
          path="workouts/:id"
          element={<ExerciseDetails exercises={exercises} setExercises={setExercises} />}
        />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;

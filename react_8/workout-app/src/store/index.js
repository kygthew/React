import { configureStore } from "@reduxjs/toolkit";
import exercisesReducer from "../features/exercises/exercisesSlice";
import recipesReducer from "../features/recipes/recipesSlice";
import pwaReducer from "../features/pwa/pwaSlice";

export const store = configureStore({
  reducer: {
    exercises: exercisesReducer, // private workouts (Firestore)
    recipes: recipesReducer, // public meal ideas (dummyjson API)
    pwa: pwaReducer, // online status + "new version" flag
  },
});

import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  online: typeof navigator === "undefined" ? true : navigator.onLine,
  updateAvailable: false,
};

const pwaSlice = createSlice({
  name: "pwa",
  initialState,
  reducers: {
    connectionChanged(state, action) {
      state.online = action.payload;
    },
    updateAvailable(state) {
      state.updateAvailable = true;
    },
  },
});

export const { connectionChanged, updateAvailable } = pwaSlice.actions;

export const selectIsOnline = (state) => state.pwa.online;
export const selectUpdateAvailable = (state) => state.pwa.updateAvailable;

export default pwaSlice.reducer;

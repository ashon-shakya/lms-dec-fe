import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    reviews: [],
    pendingReviews: [],
  },

  reducers: {
    setReviews: (state, action) => {
      state.reviews = action.payload;
    },
    setPendingReviews: (state, action) => {
      state.pendingReviews = action.payload;
    },
  },
});
export const { setReviews, setPendingReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
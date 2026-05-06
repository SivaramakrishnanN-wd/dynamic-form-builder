import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FormState {
  currentFormId: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

const initialState: FormState = {
  currentFormId: null,
  status: "idle",
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    setCurrentFormId(state, action: PayloadAction<string | null>) {
      state.currentFormId = action.payload;
    },
  },
});

export const { setCurrentFormId } = formSlice.actions;
export default formSlice.reducer;

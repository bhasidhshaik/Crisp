import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: 'not-started',
  candidate: { name: null, email: null, phone: null },
  questions: [],
  answers: [],
  currentQuestionIndex: 0,
  score: null,
  summary: null,
  isSaved: false, // <-- Add a "long-term memory" flag
};

// Helper function to check if all required details are present
const areDetailsComplete = (candidate) => {
    return candidate.name && candidate.email && candidate.phone;
};

export const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCandidateDetails: (state, action) => {
      state.candidate = { ...state.candidate, ...action.payload };
      // --- UPDATED LOGIC ---
      // After parsing, check if we have everything.
      if (areDetailsComplete(state.candidate)) {
        state.status = 'ready'; // If yes, proceed to interview.
      } else {
        state.status = 'gathering-info'; // If no, stop to ask for more info.
      }
    },
    // --- NEW ACTION ---
    // This action will be used to add the missing details and finalize.
    updateAndFinalizeDetails: (state, action) => {
        state.candidate = { ...state.candidate, ...action.payload };
        // After updating, check again.
        if (areDetailsComplete(state.candidate)) {
            state.status = 'ready';
        }
    },
    startInterview: (state, action) => {
      state.status = 'in-progress';
      state.questions = action.payload;
      state.currentQuestionIndex = 0;
      state.answers = [];
    },
    submitAnswer: (state, action) => {
      state.answers.push(action.payload);
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      } else {
        state.status = 'evaluating';
      }
    },
    setFinalResults: (state, action) => {
      state.status = 'completed';
      state.score = action.payload.score;
      state.summary = action.payload.summary;
    },
    // --- NEW ACTION ---
    markAsSaved: (state) => {
      state.isSaved = true;
    },
    resetInterview: () => initialState, // This will correctly reset isSaved to false
  },
});

export const { setCandidateDetails,updateAndFinalizeDetails, startInterview, submitAnswer, setFinalResults, markAsSaved, resetInterview } = interviewSlice.actions;

export default interviewSlice.reducer;
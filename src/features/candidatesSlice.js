import { createSlice } from '@reduxjs/toolkit';

const initialState = { list: [] };

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
};

export const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate(state, action) {
      const payload = { ...action.payload };
      const id = payload.id ?? makeId();
      state.list.unshift({ ...payload, id: String(id), status: payload.status ?? 'normal' });
    },
    clearAllCandidates(state) { state.list = []; },
    setCandidateStatus(state, action) {
      const { id, status } = action.payload;
      // replace with a new array reference (good for React re-render)
      state.list = state.list.map(candidate =>
        String(candidate.id) === String(id) ? { ...candidate, status } : candidate
      );
    },
  },
});

export const { addCandidate, clearAllCandidates, setCandidateStatus } = candidatesSlice.actions;
export default candidatesSlice.reducer;

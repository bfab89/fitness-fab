import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, ServiceConnection, ConnectedService } from '../types';

interface UserState {
  profile: UserProfile | null;
  connections: ServiceConnection[];
}

const initialState: UserState = {
  profile: null,
  connections: [
    { service: 'peloton', connected: false },
    { service: 'apple-health', connected: false },
    { service: 'apple-fitness', connected: false },
    { service: 'mynetdiary', connected: false },
  ],
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<UserProfile>) {
      state.profile = action.payload;
    },
    updateProfile(state, action: PayloadAction<Partial<UserProfile>>) {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    completeOnboarding(state) {
      if (state.profile) {
        state.profile.onboardingComplete = true;
      }
    },
    setServiceConnection(state, action: PayloadAction<ServiceConnection>) {
      const index = state.connections.findIndex(
        (c) => c.service === action.payload.service
      );
      if (index >= 0) {
        state.connections[index] = action.payload;
      } else {
        state.connections.push(action.payload);
      }
    },
    disconnectService(state, action: PayloadAction<ConnectedService>) {
      const index = state.connections.findIndex(
        (c) => c.service === action.payload
      );
      if (index >= 0) {
        state.connections[index] = {
          service: action.payload,
          connected: false,
        };
      }
    },
    updateServiceLastSync(
      state,
      action: PayloadAction<{ service: ConnectedService; lastSync: string }>
    ) {
      const conn = state.connections.find(
        (c) => c.service === action.payload.service
      );
      if (conn) {
        conn.lastSync = action.payload.lastSync;
      }
    },
  },
});

export const {
  setProfile,
  updateProfile,
  completeOnboarding,
  setServiceConnection,
  disconnectService,
  updateServiceLastSync,
} = userSlice.actions;

export default userSlice.reducer;

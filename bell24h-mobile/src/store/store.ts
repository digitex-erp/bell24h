import { configureStore } from '@reduxjs/toolkit';
import rfqSlice from './slices/rfqSlice';
import walletSlice from './slices/walletSlice';
import userSlice from './slices/userSlice';
import appSlice from './slices/appSlice';

export const store = configureStore({
  reducer: {
    rfq: rfqSlice,
    wallet: walletSlice,
    user: userSlice,
    app: appSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
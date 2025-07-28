import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { walletAPI } from '../../api/client';

// Types
export interface WalletBalance {
  userId: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdraw';
  status: string;
  newBalance: number;
  timestamp: string;
}

interface WalletState {
  balance: WalletBalance | null;
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  balance: null,
  transactions: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (userId: string, { rejectWithValue }) => {
    try {
      const data = await walletAPI.getBalance(userId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch wallet balance');
    }
  }
);

export const depositFunds = createAsyncThunk(
  'wallet/deposit',
  async ({ userId, amount }: { userId: string; amount: number }, { rejectWithValue }) => {
    try {
      const data = await walletAPI.deposit(userId, amount);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to deposit funds');
    }
  }
);

export const withdrawFunds = createAsyncThunk(
  'wallet/withdraw',
  async ({ userId, amount }: { userId: string; amount: number }, { rejectWithValue }) => {
    try {
      const data = await walletAPI.withdraw(userId, amount);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to withdraw funds');
    }
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addTransaction: (state, action: PayloadAction<WalletTransaction>) => {
      state.transactions.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch balance
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload;
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Deposit
      .addCase(depositFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(depositFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = {
          ...state.balance!,
          balance: action.payload.newBalance,
          lastUpdated: action.payload.timestamp,
        };
        state.transactions.unshift(action.payload);
      })
      .addCase(depositFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Withdraw
      .addCase(withdrawFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(withdrawFunds.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = {
          ...state.balance!,
          balance: action.payload.newBalance,
          lastUpdated: action.payload.timestamp,
        };
        state.transactions.unshift(action.payload);
      })
      .addCase(withdrawFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addTransaction } = walletSlice.actions;
export default walletSlice.reducer; 
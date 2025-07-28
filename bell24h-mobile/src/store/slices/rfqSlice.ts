import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { rfqAPI } from '../../api/client';
import { api } from '../../api/client';

// Types
export interface RFQ {
  id: string;
  title: string;
  description: string;
  requirements?: string[];
  category: string;
  budget?: number;
  status: string;
  createdAt?: string;
}

export interface VoiceRFQResult {
  text: string;
  extractedInfo: {
    title: string;
    description: string;
    category: string;
    budget?: number;
    requirements?: string[];
  };
}

interface VideoRFQFormData {
  title: string;
  description: string;
  category: string;
  budget: number;
  requirements: string[];
  maskBuyerDetails: boolean;
  videoUri: string;
}

interface RFQState {
  rfqs: RFQ[];
  currentRFQ: RFQ | null;
  voiceResult: VoiceRFQResult | null;
  loading: boolean;
  error: string | null;
  isSubmitting: boolean;
  videoRFQs: any[];
}

const initialState: RFQState = {
  rfqs: [],
  currentRFQ: null,
  voiceResult: null,
  loading: false,
  error: null,
  isSubmitting: false,
  videoRFQs: [],
};

// Async thunks
export const fetchRFQs = createAsyncThunk(
  'rfq/fetchRFQs',
  async (_, { rejectWithValue }) => {
    try {
      const data = await rfqAPI.getAll();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch RFQs');
    }
  }
);

export const createRFQ = createAsyncThunk(
  'rfq/createRFQ',
  async (rfqData: Omit<RFQ, 'id' | 'status' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const data = await rfqAPI.create(rfqData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create RFQ');
    }
  }
);

export const submitVoiceRFQ = createAsyncThunk(
  'rfq/submitVoiceRFQ',
  async ({ audioBase64, languagePreference }: { audioBase64: string; languagePreference?: string }, { rejectWithValue }) => {
    try {
      const data = await rfqAPI.submitVoice(audioBase64, languagePreference);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to process voice RFQ');
    }
  }
);

export const getRFQById = createAsyncThunk(
  'rfq/getRFQById',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await rfqAPI.getById(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch RFQ');
    }
  }
);

export const submitVideoRFQ = createAsyncThunk(
  'rfq/submitVideoRFQ',
  async (formData: VideoRFQFormData, { rejectWithValue }) => {
    try {
      // Create form data for multipart upload
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('budget', formData.budget.toString());
      data.append('requirements', JSON.stringify(formData.requirements));
      data.append('maskBuyerDetails', formData.maskBuyerDetails.toString());
      
      // Append video file
      data.append('video', {
        uri: formData.videoUri,
        type: 'video/mp4',
        name: 'video.mp4'
      } as any);

      const response = await api.post('/api/video-rfq/upload', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 100)
          );
          // You can dispatch an action here to update upload progress
        },
      });

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit video RFQ');
    }
  }
);

export const fetchVideoRFQs = createAsyncThunk(
  'rfq/fetchVideoRFQs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/video-rfq');
      return response.data.videoRFQs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch video RFQs');
    }
  }
);

export const fetchVideoRFQById = createAsyncThunk(
  'rfq/fetchVideoRFQById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/video-rfq/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch video RFQ');
    }
  }
);

// Slice
const rfqSlice = createSlice({
  name: 'rfq',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVoiceResult: (state) => {
      state.voiceResult = null;
    },
    setCurrentRFQ: (state, action: PayloadAction<RFQ | null>) => {
      state.currentRFQ = action.payload;
    },
    clearCurrentRFQ: (state) => {
      state.currentRFQ = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch RFQs
      .addCase(fetchRFQs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRFQs.fulfilled, (state, action) => {
        state.loading = false;
        state.rfqs = action.payload;
      })
      .addCase(fetchRFQs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create RFQ
      .addCase(createRFQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRFQ.fulfilled, (state, action) => {
        state.loading = false;
        state.rfqs.unshift(action.payload);
      })
      .addCase(createRFQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Voice RFQ
      .addCase(submitVoiceRFQ.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitVoiceRFQ.fulfilled, (state, action) => {
        state.loading = false;
        state.voiceResult = action.payload;
      })
      .addCase(submitVoiceRFQ.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get RFQ by ID
      .addCase(getRFQById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRFQById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRFQ = action.payload;
      })
      .addCase(getRFQById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Submit Video RFQ
      .addCase(submitVideoRFQ.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitVideoRFQ.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.videoRFQs.unshift(action.payload);
        state.currentRFQ = action.payload;
      })
      .addCase(submitVideoRFQ.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      })
      // Fetch Video RFQs
      .addCase(fetchVideoRFQs.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchVideoRFQs.fulfilled, (state, action) => {
        state.videoRFQs = action.payload;
      })
      .addCase(fetchVideoRFQs.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch Video RFQ by ID
      .addCase(fetchVideoRFQById.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchVideoRFQById.fulfilled, (state, action) => {
        state.currentRFQ = action.payload;
      })
      .addCase(fetchVideoRFQById.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearVoiceResult, setCurrentRFQ, clearCurrentRFQ } = rfqSlice.actions;
export default rfqSlice.reducer; 
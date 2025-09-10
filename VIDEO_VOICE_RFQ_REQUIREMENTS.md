# Video/Voice RFQ Feature Requirements

## 🎥 **VIDEO RFQ FEATURES TO FIX**

### **Current Issues:**
1. **Video Upload Not Working:**
   - Mock implementation in `/api/rfq/create/route.ts`
   - No actual Cloudinary integration
   - Video files not being stored

2. **Video Processing Missing:**
   - No video analysis pipeline
   - No transcription from video
   - No AI processing of video content

3. **Database Integration Broken:**
   - Video RFQ data not saving properly
   - Authentication preventing creation
   - No proper video metadata storage

### **Required Fixes:**

#### **1. Cloudinary Video Upload**
```typescript
// Replace mock implementation with real Cloudinary upload
const uploadVideoToCloudinary = async (videoFile: File) => {
  const formData = new FormData();
  formData.append('file', videoFile);
  formData.append('upload_preset', 'bell24h_videos');
  
  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`, {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};
```

#### **2. Video Processing Pipeline**
```typescript
// Add video analysis and transcription
const processVideoRFQ = async (videoUrl: string) => {
  // Extract audio from video
  const audioUrl = await extractAudioFromVideo(videoUrl);
  
  // Transcribe audio using OpenAI Whisper
  const transcription = await transcribeAudio(audioUrl);
  
  // Analyze video content for requirements
  const analysis = await analyzeVideoContent(videoUrl);
  
  return { transcription, analysis };
};
```

#### **3. Database Integration**
```typescript
// Save video RFQ to database
const createVideoRFQ = async (videoData: VideoRFQData) => {
  const videoRFQ = await prisma.videoRFQ.create({
    data: {
      title: videoData.title,
      description: videoData.description,
      videoUrl: videoData.videoUrl,
      videoPublicId: videoData.publicId,
      userId: videoData.userId,
      category: videoData.category,
      status: 'active'
    }
  });
  
  return videoRFQ;
};
```

---

## 🎤 **VOICE RFQ FEATURES TO FIX**

### **Current Issues:**
1. **Voice Transcription Not Working:**
   - Mock data being returned
   - No real AI transcription service
   - No audio processing pipeline

2. **Audio Upload Missing:**
   - No actual audio file storage
   - No audio processing
   - Mock audio URLs

3. **Database Integration Broken:**
   - Voice RFQ data not saving
   - No proper audio metadata
   - Authentication issues

### **Required Fixes:**

#### **1. OpenAI Whisper Integration**
```typescript
// Real voice transcription using OpenAI Whisper
const transcribeVoiceRFQ = async (audioBlob: Blob) => {
  const formData = new FormData();
  formData.append('file', audioBlob, 'voice-rfq.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'en');
  
  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: formData
  });
  
  return response.json();
};
```

#### **2. Audio Processing Pipeline**
```typescript
// Process voice RFQ and extract requirements
const processVoiceRFQ = async (transcription: string) => {
  // Use AI to extract RFQ data from transcription
  const extractedData = await extractRFQData(transcription);
  
  return {
    title: extractedData.title,
    description: extractedData.description,
    category: extractedData.category,
    budget: extractedData.budget,
    quantity: extractedData.quantity,
    deadline: extractedData.deadline
  };
};
```

#### **3. Database Integration**
```typescript
// Save voice RFQ to database
const createVoiceRFQ = async (voiceData: VoiceRFQData) => {
  const voiceRFQ = await prisma.voiceRFQ.create({
    data: {
      title: voiceData.title,
      description: voiceData.description,
      audioUrl: voiceData.audioUrl,
      transcription: voiceData.transcription,
      userId: voiceData.userId,
      category: voiceData.category,
      status: 'active'
    }
  });
  
  return voiceRFQ;
};
```

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Required Environment Variables:**
```bash
# Cloudinary for video upload
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenAI for voice transcription
OPENAI_API_KEY=your_openai_key

# Database (already configured)
DATABASE_URL=postgresql://user@host/database
```

### **Required Dependencies:**
```json
{
  "cloudinary": "^1.41.0",
  "openai": "^4.0.0",
  "@cloudinary/url-gen": "^1.0.0"
}
```

### **API Endpoints to Fix:**

#### **Video RFQ Endpoints:**
- `POST /api/rfq/video-upload` - Upload video to Cloudinary
- `POST /api/rfq/video` - Create video RFQ
- `GET /api/rfq/video/:id` - Get video RFQ details
- `GET /api/rfq/video` - List video RFQs

#### **Voice RFQ Endpoints:**
- `POST /api/rfq/voice` - Process voice RFQ
- `POST /api/rfq/voice-upload` - Upload audio file
- `GET /api/rfq/voice/:id` - Get voice RFQ details
- `GET /api/rfq/voice` - List voice RFQs

---

## 🧪 **TESTING REQUIREMENTS**

### **Video RFQ Tests:**
1. **Upload Test:**
   - Upload video file
   - Verify Cloudinary upload
   - Check video URL generation

2. **Processing Test:**
   - Test video analysis
   - Verify transcription
   - Check requirement extraction

3. **Database Test:**
   - Verify video RFQ creation
   - Check data persistence
   - Test retrieval

### **Voice RFQ Tests:**
1. **Recording Test:**
   - Test audio recording
   - Verify audio quality
   - Check file format

2. **Transcription Test:**
   - Test OpenAI Whisper integration
   - Verify transcription accuracy
   - Check language detection

3. **Processing Test:**
   - Test requirement extraction
   - Verify data parsing
   - Check database storage

---

## 📊 **SUCCESS CRITERIA**

### **Video RFQ Success:**
- [ ] Video upload to Cloudinary works
- [ ] Video processing pipeline functional
- [ ] Video RFQ data saves to database
- [ ] Video RFQ creation and retrieval works
- [ ] All video RFQ tests pass

### **Voice RFQ Success:**
- [ ] Voice recording works
- [ ] OpenAI Whisper transcription works
- [ ] Voice RFQ data saves to database
- [ ] Voice RFQ creation and retrieval works
- [ ] All voice RFQ tests pass

### **Integration Success:**
- [ ] Authentication works with video/voice RFQ
- [ ] Database integration complete
- [ ] API endpoints functional
- [ ] Frontend components working
- [ ] No console errors

---

## 🚀 **IMPLEMENTATION PRIORITY**

### **Phase 1: Authentication Fix (Day 1-2)**
- Fix authentication system first
- Enable video/voice RFQ creation

### **Phase 2: Video RFQ Implementation (Day 3)**
- Implement Cloudinary video upload
- Add video processing pipeline
- Connect to database

### **Phase 3: Voice RFQ Implementation (Day 3-4)**
- Implement OpenAI Whisper integration
- Add voice processing pipeline
- Connect to database

### **Phase 4: Testing & Polish (Day 4)**
- Test all functionality
- Fix any remaining issues
- Ensure production readiness

---

**These video/voice RFQ features are critical for the marketplace functionality and should be implemented after fixing authentication! 🎯**

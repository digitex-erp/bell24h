# Bell24H Mobile App

A React Native mobile application for the Bell24H B2B marketplace, featuring voice RFQ submission, wallet management, supplier discovery, and real-time trading capabilities.

## Features

### 🎤 Voice RFQ Submission
- Record voice requirements using device microphone
- AI-powered transcription and RFQ extraction
- Real-time processing with OpenAI Whisper
- Edit and refine extracted information before submission

### 💰 Wallet Management
- View current balance and transaction history
- Deposit and withdraw funds
- Real-time balance updates
- Transaction tracking and notifications

### 👥 Supplier Discovery
- Browse verified suppliers by category
- View supplier ratings and risk scores
- Search and filter suppliers
- Contact suppliers directly

### 📋 RFQ Management
- Create and manage RFQs
- Track RFQ status and progress
- Search and filter RFQs
- View detailed RFQ information

### 📊 Dashboard
- Overview of key metrics
- Quick access to common actions
- Recent activity feed
- Market insights and trends

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **Audio Recording**: Expo AV
- **API Client**: Axios
- **Icons**: Expo Vector Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bell24h-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## Project Structure

```
bell24h-mobile/
├── src/
│   ├── api/
│   │   └── client.ts              # API client configuration
│   ├── components/
│   │   └── VoiceRecorder.tsx      # Voice recording component
│   ├── screens/
│   │   ├── DashboardScreen.tsx    # Main dashboard
│   │   ├── VoiceRFQScreen.tsx     # Voice RFQ submission
│   │   ├── WalletScreen.tsx       # Wallet management
│   │   ├── SupplierScreen.tsx     # Supplier discovery
│   │   └── RFQListScreen.tsx      # RFQ management
│   └── store/
│       ├── store.ts               # Redux store configuration
│       └── slices/
│           ├── rfqSlice.ts        # RFQ state management
│           ├── walletSlice.ts     # Wallet state management
│           ├── userSlice.ts       # User state management
│           └── appSlice.ts        # App-wide state management
├── App.tsx                        # Main app component
├── package.json                   # Dependencies and scripts
├── app.json                       # Expo configuration
└── tsconfig.json                  # TypeScript configuration
```

## API Integration

The mobile app connects to the Bell24H backend API running on `localhost:3000`. Key endpoints:

- **RFQ**: `/api/rfq` - CRUD operations for RFQs
- **Voice RFQ**: `/api/rfq/voice` - Voice processing and RFQ creation
- **Wallet**: `/api/wallet/*` - Wallet operations
- **Health**: `/api/health` - API health check

## Development Workflow

### 1. Backend Setup
Ensure the Bell24H backend server is running:
```bash
cd ../server
npm run dev
```

### 2. Mobile App Development
```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### 3. Testing Voice RFQ
1. Navigate to "Voice RFQ" tab
2. Tap the microphone button to start recording
3. Speak your requirements clearly
4. Tap stop when finished
5. Review the transcribed text and extracted information
6. Edit if needed and submit

### 4. Testing Wallet Features
1. Navigate to "Wallet" tab
2. View current balance
3. Test deposit/withdraw functionality
4. Check transaction history

## Environment Configuration

Create a `.env` file in the root directory:
```env
API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install && cd ..
   ```

3. **Android build issues**
   ```bash
   npx expo run:android --clear
   ```

4. **API connection issues**
   - Ensure backend server is running on port 3000
   - Check network connectivity
   - Verify API endpoints are accessible

### Debug Mode

Enable debug mode for detailed logging:
```bash
npx expo start --dev-client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Bell24H Mobile App** - Empowering B2B commerce with voice-first technology. 
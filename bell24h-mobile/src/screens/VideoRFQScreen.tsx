import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootState } from '../store/store';
import { submitVideoRFQ } from '../store/slices/rfqSlice';
import { theme } from '../theme';
import { ProgressBar } from '../components/ProgressBar';
import { ErrorMessage } from '../components/ErrorMessage';

export const VideoRFQScreen = () => {
  const dispatch = useDispatch();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(Camera.Constants.Type.back);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // RFQ Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [requirements, setRequirements] = useState('');
  const [maskBuyerDetails, setMaskBuyerDetails] = useState(true);

  const cameraRef = useRef<Camera | null>(null);
  const videoRef = useRef<Video | null>(null);

  const isSubmitting = useSelector((state: RootState) => state.rfq.isSubmitting);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasPermission(status === 'granted' && audioStatus.status === 'granted');
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 300, // 5 minutes max
        quality: Camera.Constants.VideoQuality['720p'],
        mute: false
      });
      setVideoUri(video.uri);
      setIsPreviewMode(true);
    } catch (err) {
      console.error('Failed to record:', err);
      setError('Failed to record video. Please try again.');
    }
    setIsRecording(false);
  };

  const stopRecording = async () => {
    if (!cameraRef.current) return;
    await cameraRef.current.stopRecording();
    setIsRecording(false);
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
      videoMaxDuration: 300,
    });

    if (!result.canceled && result.assets[0].uri) {
      setVideoUri(result.assets[0].uri);
      setIsPreviewMode(true);
    }
  };

  const handleSubmit = async () => {
    if (!videoUri) {
      setError('Please record or upload a video first');
      return;
    }

    if (!title || !description || !category || !budget) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const formData = {
        title,
        description,
        category,
        budget: parseFloat(budget),
        requirements: requirements.split('\n').filter(r => r.trim()),
        maskBuyerDetails,
        videoUri
      };

      await dispatch(submitVideoRFQ(formData)).unwrap();
      Alert.alert(
        'Success',
        'Your Video RFQ has been submitted successfully!',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (err) {
      setError('Failed to submit RFQ. Please try again.');
    }
  };

  const resetForm = () => {
    setVideoUri(null);
    setIsPreviewMode(false);
    setTitle('');
    setDescription('');
    setCategory('');
    setBudget('');
    setRequirements('');
    setError(null);
    setUploadProgress(0);
  };

  if (hasPermission === null) {
    return <View style={styles.container}><ActivityIndicator /></View>;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera. Please enable camera permissions.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {!isPreviewMode ? (
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={cameraType}
              ratio="16:9"
            >
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.flipButton}
                  onPress={() => setCameraType(
                    cameraType === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back
                  )}
                >
                  <MaterialIcons name="flip-camera-ios" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.recordButton, isRecording && styles.recording]}
                  onPress={isRecording ? stopRecording : startRecording}
                >
                  <MaterialIcons 
                    name={isRecording ? "stop" : "videocam"} 
                    size={40} 
                    color="white" 
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={pickVideo}
                >
                  <MaterialIcons name="photo-library" size={30} color="white" />
                </TouchableOpacity>
              </View>
            </Camera>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Video
              ref={videoRef}
              style={styles.preview}
              source={{ uri: videoUri! }}
              useNativeControls
              resizeMode="contain"
              isLooping
            />
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                setVideoUri(null);
                setIsPreviewMode(false);
              }}
            >
              <MaterialIcons name="replay" size={24} color="white" />
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.formContainer}>
          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={3}
          />
          <TextInput
            label="Category"
            value={category}
            onChangeText={setCategory}
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Budget (₹)"
            value={budget}
            onChangeText={setBudget}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
          <TextInput
            label="Requirements (one per line)"
            value={requirements}
            onChangeText={setRequirements}
            style={styles.input}
            mode="outlined"
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity
            style={styles.privacyToggle}
            onPress={() => setMaskBuyerDetails(!maskBuyerDetails)}
          >
            <MaterialIcons
              name={maskBuyerDetails ? "check-box" : "check-box-outline-blank"}
              size={24}
              color={theme.colors.primary}
            />
            <Text style={styles.privacyText}>Mask buyer details in video</Text>
          </TouchableOpacity>

          {error && <ErrorMessage message={error} />}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <ProgressBar progress={uploadProgress} />
          )}

          <TouchableOpacity
            style={[
              styles.submitButton,
              (!videoUri || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleSubmit}
            disabled={!videoUri || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit RFQ</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  cameraContainer: {
    aspectRatio: 16/9,
    width: '100%',
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  flipButton: {
    padding: 15,
  },
  recordButton: {
    padding: 15,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
  },
  recording: {
    backgroundColor: 'red',
  },
  galleryButton: {
    padding: 15,
  },
  previewContainer: {
    aspectRatio: 16/9,
    width: '100%',
    backgroundColor: '#000',
  },
  preview: {
    flex: 1,
  },
  retakeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 5,
  },
  formContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
  },
  privacyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  privacyText: {
    marginLeft: 10,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 
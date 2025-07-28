import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Slider, Button, Grid, Paper, IconButton } from '@mui/material';
import { VolumeUp, PlayArrow, Pause, VolumeOff } from '@mui/icons-material';
import { BellSoundEffects } from '../lib/audio';

const AudioTestPage: React.FC = () => {
  const audio = useAudio();
  const [volume, setVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [isAudioSupported, setIsAudioSupported] = useState<boolean>(true);

  // Update volume when it changes
  useEffect(() => {
    audio.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted, audio]);

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const vol = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(vol);
    if (vol === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const playSound = (soundName: string, playFn: () => void) => {
    try {
      setNowPlaying(soundName);
      playFn();
      
      // Reset now playing after a delay
      setTimeout(() => {
        setNowPlaying(null);
      }, 2000);
    } catch (error) {
      console.error('Error playing sound:', error);
      setIsAudioSupported(false);
    }
  };

  const soundTests = [
    { name: 'RFQ Received', key: 'rfqReceived', play: () => audio.playRfqReceived() },
    { name: 'Match Found', key: 'matchFound', play: () => audio.playMatchFound() },
    { name: 'Transaction Complete', key: 'transactionComplete', play: () => audio.playTransactionComplete() },
    { name: 'Success', key: 'success', play: () => audio.playSuccess() },
    { name: 'Error', key: 'error', play: () => audio.playError() },
  ];

  if (!isAudioSupported) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Web Audio API is not supported in your browser. Some audio features may not work.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, position: 'relative' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Audio Test
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Volume Control
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={toggleMute} 
              color="primary"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
            </IconButton>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
              sx={{ flexGrow: 1 }}
              aria-labelledby="volume-slider"
            />
          </Box>
        </Box>

        <Typography variant="h6" gutterBottom>
          Test Sounds
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Click on any button below to test the corresponding sound effect.
        </Typography>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {soundTests.map((sound) => (
            <Grid item xs={12} sm={6} key={sound.key}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => playSound(sound.name, sound.play)}
                startIcon={<PlayArrow />}
                disabled={nowPlaying === sound.key}
                aria-label={`Play ${sound.name}`}
                sx={{
                  justifyContent: 'flex-start',
                  py: 1.5,
                  textTransform: 'none',
                  height: '100%',
                  minHeight: 80,
                }}
              >
                <Box sx={{ flexGrow: 1, textAlign: 'left' }}>
                  <Typography variant="subtitle1">{sound.name}</Typography>
                  {nowPlaying === sound.key && (
                    <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5 }}>
                      Playing...
                    </Typography>
                  )}
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Snackbar
        open={showUnsupportedWarning}
        autoHideDuration={6000}
        onClose={() => setShowUnsupportedWarning(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowUnsupportedWarning(false)} 
          severity="warning" 
          sx={{ width: '100%' }}
        >
          Audio playback is not supported or an error occurred. Please try a different browser.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AudioTestPage;

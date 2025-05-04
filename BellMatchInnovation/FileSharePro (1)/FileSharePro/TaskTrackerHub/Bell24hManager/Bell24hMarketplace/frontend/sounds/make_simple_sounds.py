#!/usr/bin/env python3
"""
Simple Sound Generator for Bell24h Notification Sounds
This script generates basic sounds for notification types using sine waves.
"""

import wave
import struct
import math
import os
from array import array

def generate_sine_wave(frequency, duration, sample_rate=44100, amplitude=0.5):
    """Generate a simple sine wave"""
    n_samples = int(sample_rate * duration)
    samples = array('h', [0] * n_samples)
    
    for i in range(n_samples):
        sample = int(amplitude * 32767.0 * math.sin(2 * math.pi * frequency * i / sample_rate))
        samples[i] = sample
    
    return samples

def generate_notification_sound(filename, frequencies, durations, pause=0.1):
    """Generate a notification sound with multiple tones"""
    sample_rate = 44100
    amplitude = 0.5
    
    # Create output data array
    data = array('h')
    
    # Add each tone with pause
    for i, (freq, duration) in enumerate(zip(frequencies, durations)):
        # Add tone
        tone = generate_sine_wave(freq, duration, sample_rate, amplitude)
        data.extend(tone)
        
        # Add pause except after the last tone
        if i < len(frequencies) - 1:
            pause_samples = int(sample_rate * pause)
            data.extend(array('h', [0] * pause_samples))
    
    # Write to WAV file
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 2 bytes (16 bits)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(data.tobytes())
    
    print(f"Generated {filename}")

def main():
    # Ensure output directory exists
    os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)
    
    # Default notification sound (simple ding)
    generate_notification_sound(
        "notification-default.wav",
        frequencies=[800],
        durations=[0.2]
    )
    
    # Message notification (two rising tones)
    generate_notification_sound(
        "message-received.wav",
        frequencies=[600, 800],
        durations=[0.1, 0.2]
    )
    
    # Bid update (three ascending tones)
    generate_notification_sound(
        "bid-update.wav",
        frequencies=[600, 750, 900],
        durations=[0.1, 0.1, 0.2]
    )
    
    # Payment notification (cash register sound-like)
    generate_notification_sound(
        "payment-processed.wav",
        frequencies=[900, 1100, 700],
        durations=[0.1, 0.15, 0.2]
    )
    
    # Delivery update (truck-like sound)
    generate_notification_sound(
        "delivery-update.wav",
        frequencies=[300, 350, 300],
        durations=[0.15, 0.1, 0.15]
    )
    
    # RFQ notification (important tone)
    generate_notification_sound(
        "rfq-notification.wav",
        frequencies=[700, 900, 700, 900],
        durations=[0.1, 0.1, 0.1, 0.2]
    )
    
    # Verification complete (success sound)
    generate_notification_sound(
        "verification-complete.wav",
        frequencies=[600, 800, 1000],
        durations=[0.1, 0.1, 0.3]
    )
    
    print("All notification sounds generated.")

if __name__ == "__main__":
    main()

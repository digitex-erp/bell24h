#!/usr/bin/env python3
"""
Convert WAV files to JavaScript code containing base64-encoded audio data.
This allows the audio to be used directly from JavaScript without external files.
"""

import os
import base64

def wav_to_js(wav_file, js_file):
    """Convert a WAV file to a JavaScript file with base64-encoded audio data"""
    with open(wav_file, 'rb') as f:
        wav_data = f.read()
    
    base64_data = base64.b64encode(wav_data).decode('utf-8')
    
    # Create JavaScript file
    with open(js_file, 'w') as f:
        f.write(f'// Auto-generated JavaScript audio data\n')
        f.write(f'// Original file: {os.path.basename(wav_file)}\n\n')
        f.write(f'const audioData = "data:audio/wav;base64,{base64_data}";\n\n')
        f.write(f'export default audioData;\n')
    
    print(f"Converted {wav_file} to {js_file}")

def main():
    # Get all WAV files in the current directory
    wav_files = [f for f in os.listdir('.') if f.endswith('.wav')]
    
    for wav_file in wav_files:
        js_file = wav_file.replace('.wav', '.js')
        wav_to_js(wav_file, js_file)
    
    # Create an index.js file to export all sounds
    with open('index.js', 'w') as f:
        f.write('// Auto-generated index file for notification sounds\n\n')
        
        for wav_file in wav_files:
            sound_name = wav_file.replace('.wav', '')
            js_var_name = ''.join(x.capitalize() for x in sound_name.split('-'))
            
            f.write(f"import {js_var_name} from './{sound_name}.js';\n")
        
        f.write('\n')
        f.write('export {\n')
        
        for i, wav_file in enumerate(wav_files):
            sound_name = wav_file.replace('.wav', '')
            js_var_name = ''.join(x.capitalize() for x in sound_name.split('-'))
            
            f.write(f"  {js_var_name}{'' if i == len(wav_files) - 1 else ','}\n")
        
        f.write('};\n')
    
    print(f"Created index.js with exports for all sounds")

if __name__ == "__main__":
    main()

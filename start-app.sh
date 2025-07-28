#!/bin/bash

# Bell24H Application Starter Script
echo "Starting Bell24H application..."

# Make sure uploads directory exists
mkdir -p uploads/audio 2>/dev/null

# Set environment variables
export PORT=8080


# Create a basic HTML file for testing if it doesn't exist
if [ ! -f public/index.html ]; then
  mkdir -p public
  cat > public/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H Voice RFQ Demo</title>
    <style>
        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h1 {
            color: #2563eb;
        }
        .card {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        button {
            background-color: #2563eb;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background-color: #1d4ed8;
        }
        button:disabled {
            background-color: #93c5fd;
            cursor: not-allowed;
        }
        .language-selector {
            margin-bottom: 20px;
        }
        .language-selector label {
            margin-right: 10px;
        }
        #results {
            white-space: pre-wrap;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
    </style>
</head>
<body>
    <h1>Bell24H Voice RFQ Demo</h1>
    
    <div class="card">
        <h2>Create RFQ with Voice</h2>
        <p>Record your voice to create a Request for Quote. The system will transcribe your voice and extract RFQ details.</p>
        
        <div class="language-selector">
            <label>
                <input type="radio" name="language" value="auto" checked>
                Auto-detect language
            </label>
            <label>
                <input type="radio" name="language" value="en">
                English
            </label>
            <label>
                <input type="radio" name="language" value="hi">
                Hindi
            </label>
        </div>
        
        <div>
            <button id="startRecording">Start Recording</button>
            <button id="stopRecording" disabled>Stop Recording</button>
        </div>
        
        <div id="recordingStatus"></div>
    </div>
    
    <div class="card">
        <h2>Results</h2>
        <div id="results">Record your voice and the results will appear here.</div>
    </div>

    <script>
        let mediaRecorder;
        let audioChunks = [];
        let recordingStream;
        
        document.getElementById('startRecording').addEventListener('click', startRecording);
        document.getElementById('stopRecording').addEventListener('click', stopRecording);
        
        async function startRecording() {
            try {
                document.getElementById('results').textContent = 'Record your voice and the results will appear here.';
                document.getElementById('recordingStatus').textContent = 'Requesting microphone access...';
                
                // Request microphone access
                recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                
                // Create and configure media recorder
                mediaRecorder = new MediaRecorder(recordingStream);
                audioChunks = [];
                
                mediaRecorder.addEventListener('dataavailable', event => {
                    audioChunks.push(event.data);
                });
                
                mediaRecorder.addEventListener('stop', processRecording);
                
                // Start recording
                mediaRecorder.start();
                
                // Update UI
                document.getElementById('startRecording').disabled = true;
                document.getElementById('stopRecording').disabled = false;
                document.getElementById('recordingStatus').textContent = 'Recording... (speak now)';
            } catch (error) {
                console.error('Error accessing microphone:', error);
                document.getElementById('recordingStatus').textContent = `Error: ${error.message}`;
            }
        }
        
        function stopRecording() {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
                recordingStream.getTracks().forEach(track => track.stop());
                
                // Update UI
                document.getElementById('startRecording').disabled = false;
                document.getElementById('stopRecording').disabled = true;
                document.getElementById('recordingStatus').textContent = 'Processing recording...';
            }
        }
        
        async function processRecording() {
            try {
                // Create audio blob and form data
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                
                // Get selected language preference
                const languagePreference = document.querySelector('input[name="language"]:checked').value;
                formData.append('languagePreference', languagePreference);
                
                document.getElementById('recordingStatus').textContent = 'Sending to server for analysis...';
                
                // Send to server
                const response = await fetch('/api/voice-rfq/process', {
                    method: 'POST',
                    body: formData
                });
                
                // Process response
                const result = await response.json();
                
                if (result.success) {
                    let resultText = 'Transcription:\n' + result.transcript + '\n\n';
                    
                    if (result.detectedLanguage && result.detectedLanguage !== 'en') {
                        resultText += `Language detected: ${result.detectedLanguage}\n\n`;
                    }
                    
                    if (result.translation) {
                        resultText += 'Translation:\n' + result.translation + '\n\n';
                    }
                    
                    resultText += 'Analyzed RFQ Details:\n' + JSON.stringify(result.analyzedRfq, null, 2);
                    
                    document.getElementById('results').textContent = resultText;
                    document.getElementById('recordingStatus').textContent = 'Recording processed successfully!';
                } else {
                    document.getElementById('results').textContent = 'Error: ' + (result.error || 'Unknown error');
                    document.getElementById('recordingStatus').textContent = 'Error processing recording.';
                }
            } catch (error) {
                console.error('Error processing recording:', error);
                document.getElementById('results').textContent = 'Error: ' + error.message;
                document.getElementById('recordingStatus').textContent = 'Error processing recording.';
            }
        }
    </script>
</body>
</html>
EOL
  echo "Created demo HTML file in public/index.html"
fi

# Run the application using tsx to execute TypeScript directly
echo "Starting server..."
npx tsx simple-server.ts

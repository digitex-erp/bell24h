const fs = require('fs');
const path = require('path');

const videosDir = path.join(__dirname, '../public/videos');

// Create videos directory if it doesn't exist
if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// Create placeholder video files
const videos = [
  { name: 'hero-background', duration: 15 },
  { name: 'step1', duration: 10 },
  { name: 'step2', duration: 10 },
  { name: 'step3', duration: 10 },
  { name: 'step4', duration: 10 }
];

videos.forEach(video => {
  const filePath = path.join(videosDir, `${video.name}.mp4`);
  
  // Create a small video file with specified duration
  const command = `ffmpeg -f lavfi -i color=c=blue:s=1280x720 -t ${video.duration} -pix_fmt yuv420p ${filePath}`;
  
  console.log(`Creating ${video.name}.mp4 (${video.duration}s)...`);
  
  // Execute command (would need ffmpeg installed)
  // For now, just create empty files as placeholders
  fs.writeFileSync(filePath, '');
});

console.log('Video assets created successfully!');

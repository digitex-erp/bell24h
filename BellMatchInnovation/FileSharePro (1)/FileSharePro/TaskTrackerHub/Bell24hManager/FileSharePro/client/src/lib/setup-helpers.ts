/**
 * Helper function to simulate a delay
 * @param ms Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper function to simulate typing in the terminal
 * @param text Text to be typed
 * @param speed Speed of typing in milliseconds
 */
export async function typeText(text: string, speed = 50): Promise<string[]> {
  const result: string[] = [];
  let currentText = '';
  
  for (let i = 0; i < text.length; i++) {
    currentText += text.charAt(i);
    result.push(currentText);
    await delay(speed);
  }
  
  return result;
}

/**
 * Helper function to format file size
 * @param bytes File size in bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Helper function to parse zip file contents
 * @param file File object
 */
export async function parseZipContents(file: File): Promise<string[]> {
  // This is a mock function that would normally use a library like JSZip
  // For the purpose of this demo, we'll return a pre-defined list of files
  await delay(1000); // Simulate processing time
  
  return [
    'package.json',
    'package-lock.json',
    'server.js',
    'README.md',
    'src/app.js',
    'src/websocket.js',
    'src/api/kotak.js',
    'src/api/kredx.js',
    'src/api/razorpayx.js',
    'src/db/postgres.js',
    'src/db/redis.js',
    'src/auth/google.js',
    'src/auth/jwt.js',
    'src/monitoring/prometheus.js',
    'src/monitoring/grafana.js'
  ];
}

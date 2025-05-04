import React, { useEffect, useRef } from 'react';

interface VoiceVisualizerProps {
  isListening: boolean;
  volume: number; // Range 0-100 representing volume level
}

/**
 * Voice Visualizer component that shows a responsive audio waveform
 * visualization based on volume input
 */
export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ 
  isListening, 
  volume 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>([]);
  
  // Initialize bars with random values for a more natural look
  useEffect(() => {
    barsRef.current = Array.from({ length: 25 }, () => Math.random() * 30);
  }, []);
  
  // Handle animation frame
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    
    // Call once and on resize
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Animation function
    const animate = () => {
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = canvas.offsetWidth / (barsRef.current.length * 2);
      const heightMultiplier = isListening ? (volume / 100) : 0.1;
      
      // Update bars
      barsRef.current = barsRef.current.map((height) => {
        if (isListening) {
          // When listening, create more dynamic movement
          const targetHeight = Math.random() * 50 * heightMultiplier + 10;
          // Smooth transition to target
          return height + (targetHeight - height) * 0.2;
        } else {
          // When not listening, bars should be still with minimal height
          return Math.max(5, height * 0.95);
        }
      });
      
      // Gradient for bars
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.offsetHeight);
      if (isListening) {
        gradient.addColorStop(0, 'rgba(0, 120, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 200, 255, 0.4)');
      } else {
        gradient.addColorStop(0, 'rgba(100, 100, 100, 0.5)');
        gradient.addColorStop(1, 'rgba(150, 150, 150, 0.2)');
      }
      
      // Draw bars
      ctx.fillStyle = gradient;
      
      barsRef.current.forEach((height, index) => {
        const x = index * barWidth * 2;
        const h = height * heightMultiplier;
        const y = (canvas.offsetHeight - h) / 2;
        
        // Rounded bars
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, h, 5);
        ctx.fill();
      });
      
      // Request next frame
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, volume]);
  
  return (
    <div className="voice-visualizer-container w-full h-12">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full rounded-md"
      />
    </div>
  );
};
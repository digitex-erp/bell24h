import React from 'react';

// Character mood types
export type CharacterMood = 'happy' | 'excited' | 'thinking' | 'curious' | 'surprised' | 'teaching' | 'celebrating';

// Character names
export type CharacterName = 'bell' | 'genie' | 'robot' | 'fairy';

// Character component props
interface OnboardingCharacterProps {
  name?: CharacterName;
  mood?: CharacterMood;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
}

/**
 * Engaging, playful character guide for onboarding
 * This component renders a cartoon-like character with different moods and expressions
 */
const OnboardingCharacter: React.FC<OnboardingCharacterProps> = ({
  name = 'bell',
  mood = 'happy',
  size = 'md',
  className = '',
  showSpeechBubble = false,
  speechText = ''
}) => {
  // Size mapping
  const sizeClass = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }[size];
  
  // Character SVG components based on name and mood
  const renderCharacter = () => {
    // Bell24h Bell mascot
    if (name === 'bell') {
      return (
        <div className={`relative ${sizeClass} ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Bell body */}
              <div className="bg-amber-400 rounded-full w-full h-full flex items-center justify-center border-2 border-amber-600 overflow-hidden">
                {/* Bell face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Eyes */}
                  <div className="flex items-center justify-center gap-3 mt-1">
                    {renderEyes()}
                  </div>
                  {/* Mouth */}
                  <div className="mt-2">
                    {renderMouth()}
                  </div>
                </div>
                
                {/* Bell handle */}
                <div className="absolute -top-3 w-4 h-4 bg-amber-700 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Speech bubble */}
          {showSpeechBubble && speechText && (
            <div className="absolute -top-12 left-full ml-2 bg-white text-black text-xs p-2 rounded-lg border border-gray-300 w-32">
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
              {speechText}
            </div>
          )}
        </div>
      );
    }
    
    // Procurement Genie
    if (name === 'genie') {
      return (
        <div className={`relative ${sizeClass} ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Genie turban and face */}
              <div className="bg-indigo-500 rounded-full w-full h-full flex items-center justify-center border-2 border-indigo-700 overflow-hidden">
                {/* Turban gem */}
                <div className="absolute top-1 w-4 h-4 bg-red-500 rounded-full border border-red-700"></div>
                
                {/* Genie face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Eyes */}
                  <div className="flex items-center justify-center gap-3 mt-3">
                    {renderEyes()}
                  </div>
                  {/* Mouth */}
                  <div className="mt-2">
                    {renderMouth()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Speech bubble */}
          {showSpeechBubble && speechText && (
            <div className="absolute -top-12 left-full ml-2 bg-white text-black text-xs p-2 rounded-lg border border-gray-300 w-32">
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
              {speechText}
            </div>
          )}
        </div>
      );
    }
    
    // AI Robot
    if (name === 'robot') {
      return (
        <div className={`relative ${sizeClass} ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Robot head */}
              <div className="bg-zinc-700 rounded-lg w-full h-full flex items-center justify-center border-2 border-zinc-800 overflow-hidden">
                {/* Antenna */}
                <div className="absolute -top-3 w-1 h-3 bg-zinc-500">
                  <div className="w-2 h-2 bg-red-500 rounded-full -mt-2 -ml-0.5"></div>
                </div>
                
                {/* Robot face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Eyes */}
                  <div className="flex items-center justify-center gap-3 mt-1">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse delay-75"></div>
                  </div>
                  {/* Mouth - LED display */}
                  <div className="mt-3 w-8 h-2 bg-cyan-400 rounded">
                    {mood === 'happy' && <div className="flex gap-0.5 px-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-0.5 h-2 bg-zinc-700 animate-pulse" style={{animationDelay: `${i * 100}ms`}}></div>
                      ))}
                    </div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Speech bubble */}
          {showSpeechBubble && speechText && (
            <div className="absolute -top-12 left-full ml-2 bg-zinc-800 text-cyan-400 text-xs p-2 rounded-lg border border-cyan-700 w-32 font-mono">
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-zinc-800 border-b-8 border-b-transparent"></div>
              {speechText}
            </div>
          )}
        </div>
      );
    }
    
    // Procurement Fairy
    if (name === 'fairy') {
      return (
        <div className={`relative ${sizeClass} ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Fairy body */}
              <div className="bg-pink-400 rounded-full w-full h-full flex items-center justify-center border-2 border-pink-600 overflow-hidden">
                {/* Fairy wings */}
                <div className="absolute -left-4 top-1/3 w-4 h-8 bg-purple-300 rounded-l-full"></div>
                <div className="absolute -right-4 top-1/3 w-4 h-8 bg-purple-300 rounded-r-full"></div>
                
                {/* Fairy face */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  {/* Eyes */}
                  <div className="flex items-center justify-center gap-3 mt-1">
                    {renderEyes()}
                  </div>
                  {/* Mouth */}
                  <div className="mt-2">
                    {renderMouth()}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Magic sparkle effect */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full animate-ping"></div>
          
          {/* Speech bubble */}
          {showSpeechBubble && speechText && (
            <div className="absolute -top-12 left-full ml-2 bg-pink-100 text-pink-800 text-xs p-2 rounded-lg border border-pink-300 w-32">
              <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-pink-100 border-b-8 border-b-transparent"></div>
              {speechText}
            </div>
          )}
        </div>
      );
    }
    
    // Fallback to emoji
    const emoji = {
      happy: '😊',
      excited: '🤩',
      thinking: '🤔',
      curious: '🧐',
      surprised: '😮',
      teaching: '👨‍🏫',
      celebrating: '🎉'
    }[mood];
    
    return (
      <div 
        className={`flex items-center justify-center bg-primary text-primary-foreground rounded-full shadow-lg ${sizeClass} ${className}`}
      >
        {emoji}
      </div>
    );
  };
  
  // Helper function to render eyes based on mood
  const renderEyes = () => {
    switch (mood) {
      case 'happy':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </>
        );
      case 'excited':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
          </>
        );
      case 'thinking':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-3 h-1 bg-black rounded-full mt-1"></div>
          </>
        );
      case 'curious':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-4 h-4 border-2 border-black rounded-full"></div>
          </>
        );
      case 'surprised':
        return (
          <>
            <div className="w-4 h-4 bg-black rounded-full"></div>
            <div className="w-4 h-4 bg-black rounded-full"></div>
          </>
        );
      case 'teaching':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </>
        );
      case 'celebrating':
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full animate-ping"></div>
            <div className="w-3 h-3 bg-black rounded-full animate-ping delay-100"></div>
          </>
        );
      default:
        return (
          <>
            <div className="w-3 h-3 bg-black rounded-full"></div>
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </>
        );
    }
  };
  
  // Helper function to render mouth based on mood
  const renderMouth = () => {
    switch (mood) {
      case 'happy':
        return <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>;
      case 'excited':
        return <div className="w-5 h-5 border-2 border-black rounded-full"></div>;
      case 'thinking':
        return <div className="w-4 h-1 bg-black rounded"></div>;
      case 'curious':
        return <div className="w-3 h-3 border-2 border-black rounded-full"></div>;
      case 'surprised':
        return <div className="w-4 h-4 border-2 border-black rounded-full"></div>;
      case 'teaching':
        return <div className="w-5 h-1 bg-black rounded"></div>;
      case 'celebrating':
        return <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>;
      default:
        return <div className="w-6 h-3 border-b-2 border-black rounded-b-full"></div>;
    }
  };
  
  return renderCharacter();
};

export default OnboardingCharacter;
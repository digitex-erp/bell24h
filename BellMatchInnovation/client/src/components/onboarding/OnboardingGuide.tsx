import React, { useState, useEffect } from 'react';
import { useOnboarding } from '@/hooks/use-onboarding';
import { Button } from '@/components/ui/button';
import OnboardingCharacter, { CharacterName } from './OnboardingCharacter';
import {
  ChevronRight,
  ChevronLeft,
  X,
  Volume2,
  VolumeX
} from 'lucide-react';

// Character mapping by flow type
const FLOW_CHARACTER_MAP: Record<string, CharacterName> = {
  'main-onboarding': 'bell',
  'voice-rfq-tutorial': 'fairy',
  'blockchain-tutorial': 'robot',
  'risk-scoring-tutorial': 'genie',
  'market-insights-tutorial': 'robot',
  'analytics-dashboard-tutorial': 'robot',
  'ai-assistant-tutorial': 'robot'
};

// Speech lines for animated typing
type CharacterSpeech = Record<string, string[]>;

const CHARACTER_SPEECH: Record<CharacterName, CharacterSpeech> = {
  'bell': {
    welcome: [
      "Hi there! I'm Bellie, your Bell24h guide!",
      "Let me show you around our platform.",
      "Ready for a fun tour?"
    ],
    excited: [
      "Wow! This feature is pretty amazing!",
      "Let me tell you all about it!",
      "You're going to love this!"
    ],
    progress: [
      "You're doing great!",
      "Keep it up, we're making good progress!",
      "Just a few more steps to go!"
    ],
    farewell: [
      "Thanks for completing the tour!",
      "You're all set to use Bell24h like a pro!",
      "Feel free to explore on your own now."
    ]
  },
  'genie': {
    welcome: [
      "Salaam! I am your procurement genie!",
      "I shall reveal the treasures of risk scoring!",
      "Your wish is my command!"
    ],
    excited: [
      "By the powers of procurement!",
      "A most magnificent feature awaits!",
      "Ancient procurement wisdom at your fingertips!"
    ],
    progress: [
      "Your journey continues well!",
      "The path to procurement mastery is clear!",
      "Soon you shall command great supplier knowledge!"
    ],
    farewell: [
      "Your training is complete, master!",
      "May your procurements be ever profitable!",
      "Remember, I am but a click away when needed!"
    ]
  },
  'robot': {
    welcome: [
      "Initializing onboarding sequence...",
      "I am RFQ-9000, your AI guide.",
      "Scanning user profile... Ready to proceed."
    ],
    excited: [
      "Alert: High-value feature detected!",
      "Processing optimal usage patterns...",
      "Recommendation: Immediate implementation."
    ],
    progress: [
      "Tour progress: 67% complete.",
      "User engagement levels: Optimal.",
      "System performance: Nominal."
    ],
    farewell: [
      "Training sequence complete.",
      "Knowledge transfer successful.",
      "Congratulations, human. You are now operational."
    ]
  },
  'fairy': {
    welcome: [
      "✨ Hello! I'm your Voice RFQ Fairy! ✨",
      "Let me sprinkle some magic on your procurement!",
      "Ready to speak your RFQs into existence?"
    ],
    excited: [
      "Oh my goodness! Look at this wonderful feature!",
      "This is simply magical! Let me show you!",
      "Wave your voice like a wand and watch the magic happen!"
    ],
    progress: [
      "You're doing wonderfully! ✨",
      "A little more magic to go!",
      "The enchantment is almost complete!"
    ],
    farewell: [
      "Your voice training is complete! ✨",
      "You're now ready to cast voice RFQ spells!",
      "Remember, just speak and the magic will happen!"
    ]
  }
};

// Helper function to calculate tooltip position
const calculatePosition = (targetEl: HTMLElement | null, position: string, tooltipEl: HTMLElement | null) => {
  if (!targetEl || !tooltipEl) return { top: 0, left: 0 };
  
  const targetRect = targetEl.getBoundingClientRect();
  const tooltipRect = tooltipEl.getBoundingClientRect();
  
  let top = 0;
  let left = 0;
  
  switch (position) {
    case 'top':
      top = targetRect.top - tooltipRect.height - 12;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'right':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.right + 12;
      break;
    case 'bottom':
      top = targetRect.bottom + 12;
      left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
      break;
    case 'left':
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      left = targetRect.left - tooltipRect.width - 12;
      break;
    case 'center':
    default:
      top = window.innerHeight / 2 - tooltipRect.height / 2;
      left = window.innerWidth / 2 - tooltipRect.width / 2;
      break;
  }
  
  // Ensure the tooltip is within viewport
  if (left < 16) left = 16;
  if (left + tooltipRect.width > window.innerWidth - 16) {
    left = window.innerWidth - tooltipRect.width - 16;
  }
  
  if (top < 16) top = 16;
  if (top + tooltipRect.height > window.innerHeight - 16) {
    top = window.innerHeight - tooltipRect.height - 16;
  }
  
  return { top, left };
};

// Character speech categories based on progress
const getSpeechCategory = (currentIndex: number, totalSteps: number): 'welcome' | 'excited' | 'progress' | 'farewell' => {
  if (currentIndex === 0) return 'welcome';
  if (currentIndex === totalSteps - 1) return 'farewell';
  
  // For middle steps, alternate between excited and progress
  return currentIndex % 2 === 0 ? 'excited' : 'progress';
};

// Get a random speech line for the given character and category
const getRandomSpeechLine = (character: CharacterName, category: 'welcome' | 'excited' | 'progress' | 'farewell'): string => {
  const lines = CHARACTER_SPEECH[character][category] || CHARACTER_SPEECH.bell[category];
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
};

// Text-to-speech using Web Speech API
const speakText = (text: string, voiceIndex = 0) => {
  if (!('speechSynthesis' in window)) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  
  if (voices.length > voiceIndex) {
    utterance.voice = voices[voiceIndex];
  }
  
  // Adjust speech parameters based on character
  utterance.rate = 1;
  utterance.pitch = 1;
  
  window.speechSynthesis.speak(utterance);
};

// Animated typing effect
const useTypingEffect = (text: string, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);
  
  return { displayedText, isTyping };
};

const OnboardingGuide: React.FC = () => {
  const { 
    isActive, 
    currentStep, 
    currentFlow, 
    nextStep, 
    prevStep, 
    skipFlow 
  } = useOnboarding();
  
  const [tooltipRef, setTooltipRef] = useState<HTMLDivElement | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightPosition, setHighlightPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [characterPosition, setCharacterPosition] = useState({ top: 0, left: 0 });
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Get character based on flow type
  const characterName: CharacterName = currentFlow 
    ? FLOW_CHARACTER_MAP[currentFlow.id] || 'bell'
    : 'bell';
  
  // Find the target element based on the selector
  useEffect(() => {
    if (!isActive || !currentStep) return;
    
    try {
      const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
      setTargetElement(element);
      
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightPosition({
          top: rect.top - 5,
          left: rect.left - 5,
          width: rect.width + 10,
          height: rect.height + 10
        });
      }
    } catch (error) {
      console.error('Error finding target element:', error);
    }
  }, [isActive, currentStep]);
  
  // Update tooltip position when target element or position changes
  useEffect(() => {
    if (!isActive || !currentStep || !tooltipRef) return;
    
    const position = calculatePosition(
      targetElement, 
      currentStep.position, 
      tooltipRef
    );
    
    setTooltipPosition(position);
    
    // Calculate character position (offset from the tooltip)
    const characterPos = { ...position };
    
    switch (currentStep.position) {
      case 'top':
        characterPos.top -= 80;
        characterPos.left -= 50;
        break;
      case 'right':
        characterPos.left += 20;
        characterPos.top -= 80;
        break;
      case 'bottom':
        characterPos.top += 20;
        characterPos.left -= 50;
        break;
      case 'left':
        characterPos.left -= 80;
        characterPos.top -= 80;
        break;
      case 'center':
      default:
        characterPos.top -= 100;
        characterPos.left -= 60;
        break;
    }
    
    setCharacterPosition(characterPos);
  }, [isActive, currentStep, targetElement, tooltipRef]);
  
  // Initialize Web Speech API when needed
  useEffect(() => {
    if ('speechSynthesis' in window && !window.speechSynthesis.getVoices().length) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now available
      };
    }
  }, []);
  
  // Get appropriate speech for current step
  const currentIndex = currentFlow?.steps.indexOf(currentStep!) ?? 0;
  const totalSteps = currentFlow?.steps.length ?? 0;
  const speechCategory = getSpeechCategory(currentIndex, totalSteps);
  const speechLine = getRandomSpeechLine(characterName, speechCategory);
  
  // Use typing effect for speech bubble
  const { displayedText, isTyping } = useTypingEffect(speechLine, 30);
  
  // Speak text if sound is enabled
  useEffect(() => {
    if (soundEnabled && !isTyping && displayedText.length > 0) {
      speakText(displayedText);
    }
    
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [displayedText, isTyping, soundEnabled]);
  
  if (!isActive || !currentStep || !currentFlow) return null;
  
  const characterMood = currentStep.characterMood || 'happy';
  
  // Background animation pattern based on character
  const getPatternClass = () => {
    switch (characterName) {
      case 'bell': return 'bg-gradient-to-r from-amber-100 to-amber-300';
      case 'genie': return 'bg-gradient-to-r from-indigo-100 to-indigo-300';
      case 'robot': return 'bg-gradient-to-r from-zinc-100 to-zinc-300';
      case 'fairy': return 'bg-gradient-to-r from-pink-100 to-pink-300';
      default: return 'bg-gradient-to-r from-blue-100 to-blue-300';
    }
  };
  
  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-[999]"
        onClick={(e) => e.target === e.currentTarget && skipFlow()}
      />
      
      {/* Target element highlight */}
      {targetElement && currentStep.targetSelector !== 'body' && (
        <div
          className="fixed z-[1000] border-2 border-primary animate-pulse rounded-md"
          style={{
            top: highlightPosition.top,
            left: highlightPosition.left,
            width: highlightPosition.width,
            height: highlightPosition.height,
            pointerEvents: 'none',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
          }}
        />
      )}
      
      {/* Character with speech bubble */}
      <div
        className="fixed z-[1001] transition-all duration-300 ease-in-out"
        style={{
          top: characterPosition.top,
          left: characterPosition.left
        }}
      >
        <OnboardingCharacter 
          name={characterName}
          mood={characterMood} 
          size="lg"
          className="animate-bounce-slow"
          showSpeechBubble={true}
          speechText={displayedText}
        />
      </div>
      
      {/* Tooltip */}
      <div
        ref={setTooltipRef}
        className={`fixed z-[1001] rounded-lg shadow-lg p-5 max-w-sm transition-all duration-300 ease-in-out ${getPatternClass()}`}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold">{currentStep.title}</h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label={soundEnabled ? "Mute" : "Enable sound"}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={skipFlow}
              aria-label="Skip tutorial"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-80 backdrop-blur-sm p-3 rounded-md mb-4">
          <p className="text-sm">{currentStep.description}</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-xs font-medium bg-white bg-opacity-60 px-2 py-1 rounded-full">
            Step {currentIndex + 1} of {totalSteps}
          </div>
          
          <div className="flex gap-2">
            {currentIndex > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                className="flex items-center gap-1 bg-white bg-opacity-70 backdrop-blur-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            
            <Button
              variant="default"
              size="sm"
              onClick={nextStep}
              className="flex items-center gap-1"
            >
              {currentIndex < totalSteps - 1 ? 'Next' : 'Finish'}
              {currentIndex < totalSteps - 1 && <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingGuide;
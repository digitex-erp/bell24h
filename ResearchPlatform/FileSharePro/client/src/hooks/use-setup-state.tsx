import { useState, useCallback } from 'react';

type StepStatus = 'pending' | 'active' | 'completed' | 'error';

export function useSetupState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(15);
  const [stepStatus, setStepStatus] = useState<StepStatus[]>([
    'completed', // Step 1 - Already completed
    'active',    // Step 2 - Upload ZIP
    'pending',   // Step 3 - GitHub
    'pending',   // Step 4 - Environment
    'pending',   // Step 5 - Dependencies
    'pending',   // Step 6 - Run
  ]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['$ <span id="typed-command"></span><span class="typed-cursor">|</span>']);
  const [fileUploaded, setFileUploaded] = useState(false);

  const addTerminalCommand = useCallback((command: string) => {
    setTerminalOutput(prev => [...prev, `$ ${command}`]);
  }, []);

  const addTerminalOutput = useCallback((output: string[]) => {
    setTerminalOutput(prev => [...prev, ...output]);
  }, []);

  const markStepComplete = useCallback((stepIndex: number) => {
    setStepStatus(prev => {
      const next = [...prev];
      next[stepIndex] = 'completed';
      return next;
    });
  }, []);

  const markStepActive = useCallback((stepIndex: number) => {
    setStepStatus(prev => {
      const next = [...prev];
      next[stepIndex] = 'active';
      return next;
    });

    setCurrentStep(stepIndex);
  }, []);

  const markStepError = useCallback((stepIndex: number) => {
    setStepStatus(prev => {
      const next = [...prev];
      next[stepIndex] = 'error';
      return next;
    });
  }, []);

  return {
    currentStep,
    progress,
    stepStatus,
    terminalOutput,
    fileUploaded,
    setCurrentStep,
    setProgress,
    setStepStatus,
    setTerminalOutput,
    setFileUploaded,
    addTerminalCommand,
    addTerminalOutput,
    markStepComplete,
    markStepActive,
    markStepError,
  };
}

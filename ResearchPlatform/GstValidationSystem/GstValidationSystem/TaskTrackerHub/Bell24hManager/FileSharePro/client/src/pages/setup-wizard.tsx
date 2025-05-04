import { Sidebar } from "@/components/layout/sidebar";
import { TopNavbar } from "@/components/layout/top-navbar";
import { ProgressBar } from "@/components/setup/progress-bar";
import { StepCard } from "@/components/setup/step-card";
import { Terminal } from "@/components/setup/terminal";
import { FileUploader } from "@/components/setup/file-uploader";
import { GithubForm } from "@/components/setup/github-form";
import { EnvVariables } from "@/components/setup/env-variables";
import { DependencyInstaller } from "@/components/setup/dependency-installer";
import { RunApplication } from "@/components/setup/run-application";
import { useSetupState } from "@/hooks/use-setup-state";
import { CheckCircle, Circle, Code, HelpCircle, Play, Settings, Terminal as TerminalIcon, Upload, KeyRound } from "lucide-react";

export default function SetupWizard() {
  const { 
    currentStep, 
    progress, 
    stepStatus, 
    terminalOutput, 
    fileUploaded,
    addTerminalCommand,
    addTerminalOutput,
    markStepComplete,
    markStepActive,
    setProgress,
    setFileUploaded,
  } = useSetupState();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <Sidebar currentStep={currentStep} />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNavbar />

        {/* Main Content Area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="border-b border-secondary-100 pb-5">
                <h2 className="text-lg leading-6 font-medium text-secondary-900">Project Setup Wizard</h2>
                <p className="mt-2 max-w-4xl text-sm text-secondary-500">
                  Follow the steps below to deploy the Bell24h project from your ZIP file to Replit and connect it to GitHub.
                </p>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="py-4">
                {/* Progress Indicator */}
                <ProgressBar progress={progress} />

                {/* Setup Steps */}
                <div className="space-y-6 mt-6">
                  {/* Step 1: Project Creation */}
                  <StepCard
                    id="step1"
                    title="Step 1: Create New Replit Project"
                    description="Create a new Node.js project in Replit named 'Bell24h'"
                    icon={<Circle />}
                    status={stepStatus[0]}
                    successMessage="Project successfully created! Ready for file upload."
                  />

                  {/* Step 2: Upload ZIP File */}
                  <StepCard
                    id="step2"
                    title="Step 2: Upload and Extract ZIP File"
                    description="Upload the Bell24h project ZIP file and extract its contents"
                    icon={<Upload />}
                    status={stepStatus[1]}
                    active={currentStep === 1}
                  >
                    <FileUploader 
                      fileUploaded={fileUploaded}
                      setFileUploaded={setFileUploaded}
                      addTerminalCommand={addTerminalCommand}
                      addTerminalOutput={addTerminalOutput}
                      onComplete={() => {
                        markStepComplete(1);
                        markStepActive(2);
                        setProgress(45);
                      }}
                    />
                    <Terminal lines={terminalOutput} />
                  </StepCard>

                  {/* Step 3: GitHub Integration */}
                  <StepCard
                    id="step3"
                    title="Step 3: Initialize Git and Connect to GitHub"
                    description="Create a GitHub repository and connect your Replit project"
                    icon={<Code />}
                    status={stepStatus[2]}
                    active={currentStep === 2}
                    disabled={currentStep < 2}
                  >
                    <GithubForm 
                      disabled={currentStep < 2}
                      addTerminalCommand={addTerminalCommand}
                      addTerminalOutput={addTerminalOutput}
                      onComplete={() => {
                        markStepComplete(2);
                        markStepActive(3);
                        setProgress(60);
                      }}
                    />
                  </StepCard>

                  {/* Step 4: Environment Variables */}
                  <StepCard
                    id="step4"
                    title="Step 4: Set Up Environment Variables"
                    description="Configure Secrets and environment variables for your project"
                    icon={<KeyRound />}
                    status={stepStatus[3]}
                    active={currentStep === 3}
                    disabled={currentStep < 3}
                  >
                    <EnvVariables 
                      disabled={currentStep < 3}
                      addTerminalCommand={addTerminalCommand}
                      addTerminalOutput={addTerminalOutput}
                      onComplete={() => {
                        markStepComplete(3);
                        markStepActive(4);
                        setProgress(75);
                      }}
                    />
                  </StepCard>

                  {/* Step 5: Install Dependencies */}
                  <StepCard
                    id="step5"
                    title="Step 5: Install Dependencies"
                    description="Install Node.js packages required for the project"
                    icon={<Settings />}
                    status={stepStatus[4]}
                    active={currentStep === 4}
                    disabled={currentStep < 4}
                  >
                    <DependencyInstaller 
                      disabled={currentStep < 4}
                      addTerminalCommand={addTerminalCommand}
                      addTerminalOutput={addTerminalOutput}
                      onComplete={() => {
                        markStepComplete(4);
                        markStepActive(5);
                        setProgress(90);
                      }}
                    />
                  </StepCard>

                  {/* Step 6: Run the Application */}
                  <StepCard
                    id="step6"
                    title="Step 6: Run the Application"
                    description="Start the Bell24h development server"
                    icon={<Play />}
                    status={stepStatus[5]}
                    active={currentStep === 5}
                    disabled={currentStep < 5}
                  >
                    <RunApplication 
                      disabled={currentStep < 5}
                      addTerminalCommand={addTerminalCommand}
                      addTerminalOutput={addTerminalOutput}
                      onComplete={() => {
                        markStepComplete(5);
                        setProgress(100);
                      }}
                    />
                  </StepCard>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { ProcurementChallengeProvider } from '../components/challenges/ProcurementChallengeContext';
import ChallengeLibrary from '../components/challenges/ChallengeLibrary';
import ChallengeRunner from '../components/challenges/ChallengeRunner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function ProcurementChallengesPage() {
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(null);
  const [completedChallengeId, setCompletedChallengeId] = useState<string | null>(null);

  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallengeId(challengeId);
  };

  const handleCompleteChallenge = () => {
    if (selectedChallengeId) {
      setCompletedChallengeId(selectedChallengeId);
      setSelectedChallengeId(null);
    }
  };

  const handleReturnToLibrary = () => {
    setSelectedChallengeId(null);
    setCompletedChallengeId(null);
  };

  return (
    <ProcurementChallengeProvider>
      <div className="min-h-screen bg-slate-50 py-8">
        {completedChallengeId && (
          <div className="container mx-auto max-w-4xl">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold mb-6">Challenge Completed!</h1>
              <p className="text-lg mb-8">
                Congratulations on completing the procurement challenge. You've demonstrated strong 
                procurement skills and decision-making abilities.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-3">Your Performance</h2>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="bg-green-500 rounded-full h-2 w-2"></div>
                    <span>Successfully completed all challenge steps</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="bg-green-500 rounded-full h-2 w-2"></div>
                    <span>Demonstrated strong procurement decision-making</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="bg-green-500 rounded-full h-2 w-2"></div>
                    <span>Applied best practices in supplier evaluation</span>
                  </li>
                </ul>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleReturnToLibrary}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Challenge Library
                </Button>
                
                <Button onClick={handleReturnToLibrary}>
                  Try Another Challenge
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {selectedChallengeId && !completedChallengeId && (
          <ChallengeRunner 
            challengeId={selectedChallengeId} 
            onComplete={handleCompleteChallenge}
            onExit={handleReturnToLibrary}
          />
        )}
        
        {!selectedChallengeId && !completedChallengeId && (
          <ChallengeLibrary onSelectChallenge={handleSelectChallenge} />
        )}
      </div>
    </ProcurementChallengeProvider>
  );
}
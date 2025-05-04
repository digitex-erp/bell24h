import React from 'react';
import MultipleChoiceInteraction from './MultipleChoiceInteraction';
import RankingInteraction from './RankingInteraction';
import MatchingInteraction from './MatchingInteraction';
import SimulationInteraction from './SimulationInteraction';
import DecisionInteraction from './DecisionInteraction';
import ScenarioInteraction from './ScenarioInteraction';

// A map of interaction type names to their component implementations
const interactionComponents = {
  'multiple-choice': MultipleChoiceInteraction,
  'ranking': RankingInteraction,
  'matching': MatchingInteraction,
  'simulation': SimulationInteraction,
  'decision': DecisionInteraction,
  'scenario': ScenarioInteraction
};

// Function to get the appropriate interaction component by type
export function getInteractionComponent(interactionType: string) {
  const Component = interactionComponents[interactionType as keyof typeof interactionComponents];
  if (!Component) {
    console.error(`Unknown interaction type: ${interactionType}`);
    return null;
  }
  return Component;
}

// Type definitions to help with validation
export type InteractionType = keyof typeof interactionComponents;

export function isValidInteractionType(type: string): type is InteractionType {
  return type in interactionComponents;
}

// Function to validate interaction content
export function validateInteractionContent(interactionType: InteractionType, content: any): boolean {
  // In a real implementation, this would validate the content based on the type
  // For now, just ensure content exists
  return !!content;
}

export default {
  getInteractionComponent,
  isValidInteractionType,
  validateInteractionContent
};
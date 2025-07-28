"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";

interface CopilotWrapperProps {
  children: React.ReactNode;
}

export default function CopilotWrapper({ children }: CopilotWrapperProps) {
  return (
    <CopilotKit
      runtimeUrl="/api/ai/chat"
      publicApiKey={process.env.NEXT_PUBLIC_COPILOT_PUBLIC_API_KEY}
      chatApiEndpoint="/api/ai/chat"
      defaultChatSettings={{
        model: "gpt-4o",
        temperature: 0.7,
      }}
    >
      {children}
      <CopilotSidebar
        labels={{
          title: "Bell24H AI Assistant",
          initial: [
            "What are the latest RFQs for electronic components?",
            "Compare suppliers for custom metal fabrication.",
            "Help me draft a contract for a new supplier.",
          ],
        }}
        defaultOpen={false}
        clickOutsideToClose={true}
        style={{
          '--copilot-kit-primary-color': '#1976d2',
          '--copilot-kit-border-radius': '8px',
        }}
      />
    </CopilotKit>
  );
}

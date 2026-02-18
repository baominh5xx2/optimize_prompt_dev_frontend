
import { useState } from "react";
import type { Route } from "./+types/home";
import { Sidebar } from "../components/Layout/Sidebar";
import { Header } from "../components/Layout/Header";
import { KnowledgeBase } from "../components/Dashboard/KnowledgeBase";
import { ChatInterface } from "../components/Dashboard/ChatInterface";
import { ProcessingModal, type AgentStep } from "../components/Dashboard/ProcessingModal";
import { useAuth } from "../context/AuthContext";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "DevPrompt Optimizer" },
    { name: "description", content: "AI-Powered Prompt Engineering Studio" },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);

  // Knowledge context — lifted state (local only, sent with each chat message)
  const [templateInstructions, setTemplateInstructions] = useState("");
  const [contextContent, setContextContent] = useState("");

  // Redirect to login if not authenticated
  if (!isLoading && !isAuthenticated) {
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-primary text-5xl animate-spin">sync</span>
          <span className="text-slate-400 text-sm">Loading workspace...</span>
        </div>
      </div>
    );
  }

  const handleProcessingStart = (initialSteps: AgentStep[]) => {
    setSteps(initialSteps);
    setIsProcessing(true);
    setShowModal(true);
  };

  const handleProcessingEnd = () => {
    setIsProcessing(false);
    // Keep showModal true briefly so user sees final state, then auto-close
    setTimeout(() => setShowModal(false), 1500);
  };

  const handleStepsUpdate = (updater: (prev: AgentStep[]) => AgentStep[]) => {
    setSteps(updater);
  };

  const handleCancelProcessing = () => {
    setIsProcessing(false);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleReopenModal = () => {
    if (steps.length > 0) {
      setShowModal(true);
    }
  };

  // Build knowledge context payload (only if either field has content)
  const knowledgeContext =
    templateInstructions || contextContent
      ? { template_instructions: templateInstructions, context_content: contextContent }
      : null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onNewOptimization={() => { }}
          activeSessionId={activeSessionId}
          onSelectSession={setActiveSessionId}
        />
        <main className="flex-1 flex flex-col min-w-0 bg-[#0c0c16]">
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            <KnowledgeBase
              templateInstructions={templateInstructions}
              contextContent={contextContent}
              onTemplateChange={setTemplateInstructions}
              onContextChange={setContextContent}
            />
            <ChatInterface
              sessionId={activeSessionId}
              knowledgeContext={knowledgeContext}
              onProcessingStart={handleProcessingStart}
              onProcessingEnd={handleProcessingEnd}
              onStepsUpdate={handleStepsUpdate}
              onSessionCreated={setActiveSessionId}
              onViewReasoning={handleReopenModal}
              hasReasoningSteps={steps.length > 0}
            />
          </div>
        </main>
      </div>
      <ProcessingModal
        isOpen={showModal}
        steps={steps}
        onCancel={isProcessing ? handleCancelProcessing : handleCloseModal}
      />
    </div>
  );
}

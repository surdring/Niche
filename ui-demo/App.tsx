import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { TemplateSelector } from './components/TemplateSelector';
import { ChatInterface } from './components/ChatInterface';
import { KnowledgePanel } from './components/KnowledgePanel';
import { AppState, ChatSession, ScenarioTemplate, Citation } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TEMPLATE_SELECTION);
  const [currentTemplate, setCurrentTemplate] = useState<ScenarioTemplate | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);

  const handleTemplateSelect = (template: ScenarioTemplate) => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: '新会话',
      templateId: template.id,
      updatedAt: Date.now()
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
    setCurrentTemplate(template);
    setAppState(AppState.CHAT_SESSION);
    setActiveCitations([]); // Reset citations for new chat
  };

  const handleNewChat = () => {
    setAppState(AppState.TEMPLATE_SELECTION);
    setCurrentTemplate(null);
    setCurrentSessionId(null);
  };

  const handleSelectSession = (id: string) => {
    // In a real app, we would load the session history here.
    // For now, we just switch visual state to that ID.
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      // We would also need to recover the template from the session
      // Mocking it just to show UI flow:
      setAppState(AppState.CHAT_SESSION);
    }
  };

  const handleUpdateTitle = (title: string) => {
    if (currentSessionId) {
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, title } : s
      ));
    }
  };

  const handleAddCitation = (citation: Citation) => {
    setActiveCitations(prev => {
      if (prev.find(c => c.id === citation.id)) return prev;
      return [...prev, citation];
    });
  };

  return (
    <div className="flex h-screen bg-primary overflow-hidden">
      
      {/* Left Sidebar (Navigation) */}
      <Sidebar 
        onNewChat={handleNewChat}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {appState === AppState.TEMPLATE_SELECTION && (
          <TemplateSelector onSelect={handleTemplateSelect} />
        )}

        {appState === AppState.CHAT_SESSION && currentTemplate && (
          <div className="flex h-full">
             <ChatInterface 
               template={currentTemplate} 
               onUpdateTitle={handleUpdateTitle}
               onAddCitation={handleAddCitation}
             />
             
             {/* Right Sidebar (Context/Knowledge) - Only show if RAG capability is enabled */}
             {currentTemplate.capabilities.rag && (
                <KnowledgePanel citations={activeCitations} isVisible={true} />
             )}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;
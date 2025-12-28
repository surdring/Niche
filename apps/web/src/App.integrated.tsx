import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TemplateSelector } from './components/TemplateSelector';
import { ChatInterfaceIntegrated } from './components/ChatInterfaceIntegrated';
import { KnowledgePanelIntegrated } from './components/KnowledgePanelIntegrated';
import { AppState, ChatSession, ScenarioTemplate, Citation } from './types';
import { listTemplates, createTask, type CreateTaskInput } from './lib/api/graphql';
import type { GraphqlTemplate } from '@niche/core/contracts';

// 将 GraphQL 模板转换为 UI 模板格式
const convertGraphqlTemplate = (t: GraphqlTemplate): ScenarioTemplate => {
  return {
    id: t.id,
    name: t.name,
    description: t.description || '',
    icon: 'book', // 默认图标，可以根据 templateId 映射
    systemInstruction: '', // 从后端获取
    capabilities: {
      rag: true, // 默认启用，可以从模板定义中读取
      webSearch: false,
      reasoning: true,
      coding: false,
    },
    suggestedPrompts: []
  };
};

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.TEMPLATE_SELECTION);
  const [currentTemplate, setCurrentTemplate] = useState<ScenarioTemplate | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [activeCitations, setActiveCitations] = useState<Citation[]>([]);
  
  // 后端集成状态
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(undefined);
  
  // 请求上下文
  const [tenantId] = useState<string>('tenant_1');
  const [projectId] = useState<string>('proj_default');

  // 加载模板列表
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoadingTemplates(true);
        const requestId = `req_web_${Math.random().toString(16).slice(2)}`;
        const templateList = await listTemplates({ tenantId, projectId, requestId });
        
        const converted = templateList.map(convertGraphqlTemplate);
        setTemplates(converted);
      } catch (error) {
        console.error('Failed to load templates:', error);
        // 降级：使用本地模板
        // setTemplates(SCENARIO_TEMPLATES);
      } finally {
        setIsLoadingTemplates(false);
      }
    };

    void loadTemplates();
  }, [tenantId, projectId]);

  const handleTemplateSelect = async (template: ScenarioTemplate) => {
    try {
      // 创建任务
      const requestId = `req_web_${Math.random().toString(16).slice(2)}`;
      const input: CreateTaskInput = {
        projectId,
        templateId: template.id,
        templateVersion: 'latest' // 或从模板中获取
      };
      
      const result = await createTask({ tenantId, projectId, requestId }, input);
      
      const newSession: ChatSession = {
        id: result.session.id,
        title: '新会话',
        templateId: template.id,
        updatedAt: Date.now()
      };
      
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newSession.id);
      setCurrentTaskId(result.taskId);
      setCurrentTemplate(template);
      setAppState(AppState.CHAT_SESSION);
      setActiveCitations([]);
    } catch (error) {
      console.error('Failed to create task:', error);
      // 降级：仍然允许进入对话界面
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
      setActiveCitations([]);
    }
  };

  const handleNewChat = () => {
    setAppState(AppState.TEMPLATE_SELECTION);
    setCurrentTemplate(null);
    setCurrentSessionId(null);
    setCurrentTaskId(undefined);
  };

  const handleSelectSession = (id: string) => {
    const session = sessions.find(s => s.id === id);
    if (session) {
      setCurrentSessionId(id);
      setAppState(AppState.CHAT_SESSION);
      // TODO: 加载会话历史
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
          <TemplateSelector 
            templates={templates}
            isLoading={isLoadingTemplates}
            onSelect={handleTemplateSelect} 
          />
        )}

        {appState === AppState.CHAT_SESSION && currentTemplate && currentSessionId && (
          <div className="flex h-full">
             <ChatInterfaceIntegrated 
               template={currentTemplate}
               sessionId={currentSessionId}
               {...(currentTaskId !== undefined ? { taskId: currentTaskId } : {})}
               tenantId={tenantId}
               projectId={projectId}
               onUpdateTitle={handleUpdateTitle}
               onAddCitation={handleAddCitation}
             />
             
             {/* Right Sidebar (Context/Knowledge) - Only show if RAG capability is enabled */}
             {currentTemplate.capabilities.rag && (
                <KnowledgePanelIntegrated 
                  citations={activeCitations} 
                  isVisible={true}
                  tenantId={tenantId}
                  projectId={projectId}
                />
             )}
          </div>
        )}
      </main>

    </div>
  );
}

export default App;

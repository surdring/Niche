import React, { useState, useRef, useEffect } from 'react';
import { Message, Role, ScenarioTemplate, Citation } from '../types';
import { Icons } from './Icons';
import { runStream, type StreamMessage } from '../lib/api/stream';
import type { StepEvent, StreamCacheMetadata } from '@niche/core/contracts';

interface ChatInterfaceIntegratedProps {
  template: ScenarioTemplate;
  sessionId: string;
  taskId?: string;
  tenantId: string;
  projectId: string;
  onUpdateTitle: (title: string) => void;
  onAddCitation: (citation: Citation) => void;
}

export const ChatInterfaceIntegrated: React.FC<ChatInterfaceIntegratedProps> = ({ 
  template,
  sessionId,
  taskId,
  tenantId,
  projectId,
  onUpdateTitle,
  onAddCitation 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<string | undefined>(undefined);
  const [events, setEvents] = useState<StepEvent[]>([]);
  const [cacheMeta, setCacheMeta] = useState<StreamCacheMetadata | undefined>(undefined);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();
    const botMsg: Message = {
      id: botMsgId,
      role: Role.MODEL,
      content: '',
      timestamp: Date.now(),
      isThinking: template.capabilities.reasoning
    };

    setMessages(prev => [...prev, botMsg]);

    if (messages.length === 0) {
      onUpdateTitle(userMsg.content.slice(0, 30) + "...");
    }

    // 准备请求上下文
    const requestId = `req_web_${Math.random().toString(16).slice(2)}`;
    const ctx = { tenantId, projectId, requestId };

    // 准备消息历史
    const streamMessages: StreamMessage[] = messages.map(m => ({
      role: m.role === Role.USER ? 'user' : 'assistant',
      content: m.content
    }));
    streamMessages.push({ role: 'user', content: userMsg.content });

    // 创建 AbortController
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      await runStream(
        ctx,
        {
          taskId,
          sessionId,
          messages: streamMessages,
          templateRef: {
            templateId: template.id,
            templateVersion: 'latest'
          }
        },
        {
          signal: abort.signal,
          onToken: (text) => {
            setMessages(prev => prev.map(m => {
              if (m.id === botMsgId) {
                return { ...m, content: m.content + text, isThinking: false };
              }
              return m;
            }));
          },
          onPart: (part) => {
            if (part.type === 'data-stage') {
              setStage(part.data.stage);
              return;
            }
            if (part.type === 'data-cache-metadata') {
              setCacheMeta(part.data);
              return;
            }
            if (part.type === 'data-step-event') {
              setEvents(prev => [...prev, part.data]);
              return;
            }
            if (part.type === 'data-citations') {
              // 转换为 UI Citation 格式
              part.data.forEach(c => {
                onAddCitation({
                  id: c.citationId,
                  title: c.sourceId || 'Unknown Source',
                  url: '#',
                  snippet: c.snippet || '',
                  source: 'RAGFlow'
                });
              });
              return;
            }
            if (part.type === 'data-app-error') {
              setMessages(prev => prev.map(m => {
                if (m.id === botMsgId) {
                  return { 
                    ...m, 
                    content: m.content + `\n\n[错误: ${part.data.code} - ${part.data.message}]`, 
                    isThinking: false 
                  };
                }
                return m;
              }));
              return;
            }
            if (part.type === 'error') {
              setMessages(prev => prev.map(m => {
                if (m.id === botMsgId) {
                  return { 
                    ...m, 
                    content: m.content + `\n\n[错误: ${part.errorText}]`, 
                    isThinking: false 
                  };
                }
                return m;
              }));
            }
          }
        }
      );
    } catch (error) {
      if (!abort.signal.aborted) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        setMessages(prev => prev.map(m => {
          if (m.id === botMsgId) {
            return { 
              ...m, 
              content: m.content + `\n\n[错误: ${errorMsg}]`, 
              isThinking: false 
            };
          }
          return m;
        }));
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    const controller = abortRef.current;
    if (controller && !controller.signal.aborted) {
      controller.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative bg-primary">
      {/* Header */}
      <div className="h-16 border-b border-slate-700 flex items-center justify-between px-6 bg-primary/95 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800 rounded-lg text-accent">
            {template.name.includes("Research") || template.name.includes("研究") ? <Icons.Book size={18} /> : <Icons.GraduationCap size={18} />}
          </div>
          <div>
            <h2 className="font-semibold text-slate-200">{template.name}</h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
               <span className="flex items-center gap-1"><Icons.Shield size={10} /> 护栏已启用</span>
               <span>•</span>
               <span>{stage || '就绪'}</span>
               {cacheMeta?.cached && <span>• 缓存命中</span>}
            </div>
          </div>
        </div>
        {isLoading && (
          <button
            onClick={handleCancel}
            className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
          >
            取消
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <Icons.Bot size={48} className="mb-4 text-slate-700" />
            <p>开始对话，启动您的研究任务。</p>
            {template.suggestedPrompts && template.suggestedPrompts.length > 0 && (
              <div className="mt-8 space-y-2 max-w-2xl">
                <p className="text-sm text-slate-600 mb-3">建议问题：</p>
                {template.suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="block w-full text-left px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-4 max-w-4xl mx-auto ${msg.role === Role.USER ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === Role.USER ? 'bg-slate-700' : 'bg-accent/20 text-accent'
            }`}>
              {msg.role === Role.USER ? <Icons.User size={20} /> : <Icons.Bot size={20} />}
            </div>

            <div className={`flex flex-col max-w-[80%] ${msg.role === Role.USER ? 'items-end' : 'items-start'}`}>
              <div className={`rounded-2xl p-4 shadow-sm ${
                msg.role === Role.USER 
                  ? 'bg-slate-700 text-slate-100 rounded-tr-sm' 
                  : 'bg-transparent text-slate-300 px-0 pt-0'
              }`}>
                {msg.isThinking ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm italic thinking-pulse">
                    <Icons.Cpu size={14} />
                    <span>正在分析与推理...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Step Events Timeline (可选展示) */}
        {events.length > 0 && (
          <div className="max-w-4xl mx-auto mt-8 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">执行步骤</h3>
            <div className="space-y-1 text-xs text-slate-500">
              {events.slice(-5).map((event, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-accent">•</span>
                  <span>{event.type}: {event.stepName || 'Step'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="relative bg-secondary rounded-xl border border-slate-700 shadow-2xl focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all duration-200">
           <textarea
             ref={inputRef}
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={handleKeyDown}
             placeholder="输入问题或描述您的研究主题..."
             disabled={isLoading}
             className="w-full bg-transparent text-slate-200 placeholder-slate-500 p-4 max-h-48 min-h-[60px] resize-none outline-none text-sm md:text-base scrollbar-hide disabled:opacity-50"
             rows={1}
             style={{ height: 'auto', minHeight: '60px' }}
           />
           <div className="absolute bottom-2 right-2 flex items-center gap-2">
             <button 
               onClick={handleSubmit}
               disabled={!input.trim() || isLoading}
               className={`p-2 rounded-lg transition-colors ${
                 input.trim() && !isLoading 
                   ? 'bg-accent hover:bg-accent-hover text-white' 
                   : 'bg-slate-800 text-slate-600 cursor-not-allowed'
               }`}
             >
               <Icons.Send size={18} />
             </button>
           </div>
        </div>
        <div className="text-center mt-2">
          <p className="text-[10px] text-slate-600">
            Niche 可能会犯错。请通过引用面板验证重要信息。
          </p>
        </div>
      </div>
    </div>
  );
};

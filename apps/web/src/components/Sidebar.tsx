import React from 'react';
import { Icons } from './Icons';
import { ChatSession } from '../types';

interface SidebarProps {
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  sessions, 
  currentSessionId, 
  onSelectSession 
}) => {
  return (
    <div className="w-64 h-full bg-secondary border-r border-slate-700 flex flex-col hidden md:flex">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-blue-600 rounded-lg flex items-center justify-center">
          <Icons.Cpu className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">Niche</span>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-lg shadow-accent/20"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>新建会话</span>
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6">
        
        {/* Recent History */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            历史记录
          </h3>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-600 italic">无最近记录</div>
            ) : (
              sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors truncate ${
                    currentSessionId === session.id 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icons.Chat className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{session.title}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Tools/Modules */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            核心模块
          </h3>
          <div className="space-y-1">
            <button className="w-full text-left px-3 py-2 text-sm rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-2">
              <Icons.Database className="w-4 h-4" />
              <span>RAG 知识库</span>
            </button>
            <button className="w-full text-left px-3 py-2 text-sm rounded-md text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center gap-2">
              <Icons.Shield className="w-4 h-4" />
              <span>护栏与评估</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-slate-700">
        <button className="flex items-center gap-3 w-full p-2 hover:bg-slate-800 rounded-lg transition-colors">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-slate-200">Jane Doe</div>
            <div className="text-xs text-slate-500">免费版</div>
          </div>
          <Icons.Settings className="w-4 h-4 text-slate-500" />
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { SCENARIO_TEMPLATES } from '../constants';
import { ScenarioTemplate } from '../types';
import { Icons } from './Icons';

interface TemplateSelectorProps {
  onSelect: (template: ScenarioTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'book': return <Icons.Book className="w-6 h-6" />;
      case 'graduation-cap': return <Icons.GraduationCap className="w-6 h-6" />;
      case 'pen-tool': return <Icons.Pen className="w-6 h-6" />;
      default: return <Icons.Chat className="w-6 h-6" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-5xl mx-auto px-6 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">今天想研究什么？</h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg">
          Niche 是您的学习和研究伙伴。选择一个场景模板，为智能体配置专门的工具、安全护栏和深度推理能力。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {SCENARIO_TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template)}
            className="group relative flex flex-col items-start p-6 bg-secondary border border-slate-700 rounded-xl hover:border-accent hover:shadow-xl hover:shadow-accent/10 transition-all duration-300 text-left"
          >
            <div className="mb-4 p-3 rounded-lg bg-slate-800 text-accent group-hover:scale-110 transition-transform duration-300">
              {getIcon(template.icon)}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{template.name}</h3>
            <p className="text-slate-400 text-sm mb-6 flex-1">{template.description}</p>
            
            <div className="w-full border-t border-slate-700 pt-4 mt-auto">
              <div className="flex flex-wrap gap-2">
                {template.capabilities.rag && (
                  <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-300 rounded border border-blue-900/50">RAG检索</span>
                )}
                {template.capabilities.reasoning && (
                  <span className="text-xs px-2 py-1 bg-purple-900/30 text-purple-300 rounded border border-purple-900/50">深度推理</span>
                )}
                {template.capabilities.webSearch && (
                  <span className="text-xs px-2 py-1 bg-green-900/30 text-green-300 rounded border border-green-900/50">联网搜索</span>
                )}
              </div>
            </div>
            
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
              <Icons.ArrowRight className="text-accent" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
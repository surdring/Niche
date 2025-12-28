import React from 'react';
import { Icons } from './Icons';
import { Citation } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface KnowledgePanelProps {
  citations: Citation[];
  isVisible: boolean;
}

// Mock data for the "Knowledge Composition" chart
const data = [
  { name: '学术期刊', value: 400 },
  { name: '网络来源', value: 300 },
  { name: '上传文档', value: 300 },
];

const COLORS = ['#0ea5e9', '#6366f1', '#10b981'];

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ citations, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="w-80 h-full bg-secondary border-l border-slate-700 flex flex-col overflow-hidden hidden xl:flex">
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <h3 className="font-semibold text-slate-200 flex items-center gap-2">
          <Icons.Book className="w-4 h-4 text-accent" />
          <span>知识与引用</span>
        </h3>
        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">RAG 已激活</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Source Distribution Visualization (Mock) */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
           <h4 className="text-xs font-semibold text-slate-400 mb-2 uppercase">来源构成</h4>
           <div className="h-40 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data}
                   cx="50%"
                   cy="50%"
                   innerRadius={40}
                   outerRadius={60}
                   fill="#8884d8"
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {data.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                 />
               </PieChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Citation List */}
        <div>
          <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase flex items-center gap-2">
             <Icons.Search className="w-3 h-3" />
             参考资料 {citations.length > 0 && `(${citations.length})`}
          </h4>
          
          <div className="space-y-3">
            {citations.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8 italic border border-dashed border-slate-700 rounded-lg">
                当前上下文中无引用资料。
              </div>
            ) : (
              citations.map((cite) => (
                <div key={cite.id} className="bg-slate-800 rounded-lg p-3 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-mono text-accent bg-accent/10 px-1.5 rounded">[{cite.id}]</span>
                    <Icons.ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-accent" />
                  </div>
                  <h5 className="text-sm font-medium text-slate-200 line-clamp-2 leading-tight mb-1">{cite.title}</h5>
                  <p className="text-xs text-slate-500 line-clamp-2">{cite.snippet}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${cite.source === 'RAGFlow' ? 'bg-indigo-500' : 'bg-green-500'}`}></span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wide">{cite.source}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
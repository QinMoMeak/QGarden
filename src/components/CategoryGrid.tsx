import React from 'react';
import { Note } from '../types';
import { motion } from 'motion/react';
import { Book, Code, MessageSquare, PenTool, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryGridProps {
  notes: Note[];
  onNoteSelect: (id: string) => void;
  onCategorySelect: (category: string) => void;
}

const CATEGORIES = [
  { 
    id: '编程', 
    name: '编程知识', 
    icon: Code, 
    color: 'bg-blue-500', 
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600',
    description: '技术难点、框架学习与源码解析'
  },
  { 
    id: '面试', 
    name: '面试逐字稿', 
    icon: MessageSquare, 
    color: 'bg-indigo-500', 
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    description: '整理的面试回答与高频考点'
  },
  { 
    id: '收藏', 
    name: '收藏小说', 
    icon: Book, 
    color: 'bg-emerald-500', 
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    description: '触动心灵的文字与文学收藏'
  },
  { 
    id: '日记', 
    name: '个人日记', 
    icon: PenTool, 
    color: 'bg-rose-500', 
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    description: '生活感悟、碎碎念与日常点滴'
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ notes, onNoteSelect, onCategorySelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-6"
        >
          欢迎来到我的数字花园
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-extrabold text-slate-900 tracking-tight mb-6"
        >
          探索知识的边界
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto"
        >
          这里记录了我的学习历程、面试心得、收藏的小说以及日常随笔。
        </motion.p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
        {CATEGORIES.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx + 0.3 }}
            onClick={() => onCategorySelect(cat.id)}
            className="group relative p-8 rounded-3xl border border-slate-100 bg-white hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden cursor-pointer"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110", cat.lightColor)}>
              <cat.icon className={cat.textColor} size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">{cat.name}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              {cat.description}
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600">
              查看全部 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] -mr-8 -mt-8 rounded-full", cat.color)} />
          </motion.div>
        ))}
      </div>

      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">最近更新</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">查看所有笔记</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.slice(0, 4).map((note, idx) => (
            <motion.button
              key={note.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx + 0.5 }}
              onClick={() => onNoteSelect(note.id)}
              className="flex items-center gap-6 p-5 rounded-2xl border border-slate-100 bg-white hover:border-indigo-100 hover:bg-indigo-50/30 transition-all text-left group"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-indigo-500 transition-colors shrink-0">
                <Book size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">{note.category}</div>
                <h4 className="text-lg font-bold text-slate-900 truncate">{note.title}</h4>
                <div className="text-slate-400 text-xs mt-1">{new Date(note.lastModified).toLocaleDateString()}</div>
              </div>
              <ArrowRight size={18} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

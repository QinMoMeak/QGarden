import React from 'react';
import { Note } from '../types';
import { motion } from 'motion/react';
import { Book, Code, MessageSquare, PenTool, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategoryGridProps {
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

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <header className="mb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium mb-6"
        >
          欢迎来到我的数字花园
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
        >
          探索知识的边界
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto"
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
            className="group relative p-8 rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-2xl hover:shadow-indigo-500/10 dark:hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden cursor-pointer"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110", cat.lightColor, "dark:bg-indigo-900/20")}>
              <cat.icon className={cn(cat.textColor, "dark:text-indigo-400")} size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{cat.name}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
              {cat.description}
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
              查看全部 <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className={cn("absolute top-0 right-0 w-32 h-32 opacity-[0.03] dark:opacity-[0.08] -mr-8 -mt-8 rounded-full", cat.color)} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

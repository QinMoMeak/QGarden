import React from 'react';
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
    darkLightColor: 'dark:bg-blue-500/12',
    darkTextColor: 'dark:text-blue-300',
    description: '技术难点、框架学习与源码解析',
  },
  {
    id: '面试',
    name: '面试逐字稿',
    icon: MessageSquare,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    darkLightColor: 'dark:bg-indigo-500/12',
    darkTextColor: 'dark:text-indigo-300',
    description: '整理的面试回答与高频考点',
  },
  {
    id: '收藏',
    name: '收藏小说',
    icon: Book,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    darkLightColor: 'dark:bg-emerald-500/12',
    darkTextColor: 'dark:text-emerald-300',
    description: '触动心灵的文字与文学收藏',
  },
  {
    id: '日记',
    name: '个人日记',
    icon: PenTool,
    color: 'bg-rose-500',
    lightColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    darkLightColor: 'dark:bg-rose-500/12',
    darkTextColor: 'dark:text-rose-300',
    description: '生活感悟、碎碎念与日常点滴',
  },
];

export const CategoryGrid: React.FC<CategoryGridProps> = ({ onCategorySelect }) => {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100"
        >
          探索知识的边界
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto max-w-2xl text-xl text-slate-500 dark:text-slate-300"
        >
          这里记录了我的学习历程、面试心得、收藏的小说以及日常随笔。
        </motion.p>
      </header>

      <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index + 0.3 }}
            onClick={() => onCategorySelect(category.id)}
            className="group relative cursor-pointer overflow-hidden rounded-3xl border border-slate-100 bg-white p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/82 dark:shadow-[0_18px_45px_-32px_rgba(15,23,42,0.95)] dark:hover:border-slate-700 dark:hover:shadow-[0_24px_60px_-32px_rgba(79,70,229,0.28)]"
          >
            <div
              className={cn(
                'mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-500 group-hover:scale-110',
                category.lightColor,
                category.darkLightColor,
              )}
            >
              <category.icon className={cn(category.textColor, category.darkTextColor)} size={28} />
            </div>
            <h3 className="mb-3 text-xl font-bold text-slate-900 dark:text-slate-100">
              {category.name}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-slate-500 dark:text-slate-300">
              {category.description}
            </p>
            <div className="flex items-center text-sm font-bold text-indigo-600 dark:text-slate-100">
              查看全部
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
            </div>
            <div
              className={cn(
                'absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full opacity-[0.03] dark:opacity-[0.11]',
                category.color,
              )}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

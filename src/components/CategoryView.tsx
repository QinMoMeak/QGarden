import React, { useState, useMemo } from 'react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, ArrowUpDown, Calendar, ArrowRight, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { InterviewDirectoryView } from './InterviewDirectoryView';
import { INTERVIEW_CATEGORY, isInterviewVaultNote } from '../data/interviewNotes';

interface CategoryViewProps {
  category: string;
  notes: Note[];
  onNoteSelect: (id: string) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({ category, notes, onNoteSelect }) => {
  const [activeTag, setActiveTag] = useState<string>('全部');
  const [activeYear, setActiveYear] = useState<string>('全部');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const categoryNotes = useMemo(() => {
    return notes.filter(n => n.category === category);
  }, [notes, category]);

  const isInterviewDirectory = useMemo(() => {
    return category === INTERVIEW_CATEGORY && categoryNotes.every(isInterviewVaultNote);
  }, [category, categoryNotes]);

  if (isInterviewDirectory) {
    return <InterviewDirectoryView notes={categoryNotes} onNoteSelect={onNoteSelect} />;
  }

  const tags = useMemo(() => {
    const allTags = categoryNotes.flatMap(n => n.tags);
    return ['全部', ...Array.from(new Set(allTags))];
  }, [categoryNotes]);

  const years = useMemo(() => {
    const allYears = categoryNotes.map(n => new Date(n.lastModified).getFullYear().toString());
    return ['全部', ...Array.from(new Set(allYears)).sort((a, b) => b.localeCompare(a))];
  }, [categoryNotes]);

  const filteredNotes = useMemo(() => {
    let result = categoryNotes;
    
    if (activeTag !== '全部') {
      result = result.filter(n => n.tags.includes(activeTag));
    }
    
    if (activeYear !== '全部') {
      result = result.filter(n => new Date(n.lastModified).getFullYear().toString() === activeYear);
    }
    
    return [...result].sort((a, b) => {
      const dateA = new Date(a.lastModified).getTime();
      const dateB = new Date(b.lastModified).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [categoryNotes, activeTag, activeYear, sortOrder]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
      {/* Left Sidebar: Filters */}
      <aside className="w-full md:w-64 shrink-0 space-y-8">
        <div>
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg mb-6">
            <Filter size={20} className="text-indigo-500" />
            <span>标签筛选</span>
          </div>
          
          <nav className="flex flex-wrap md:flex-col gap-2">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={cn(
                  "px-4 py-2 md:py-3 rounded-xl text-sm font-medium transition-all text-left flex items-center justify-between group whitespace-nowrap",
                  activeTag === tag 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 dark:bg-indigo-500/85 dark:text-white dark:shadow-[0_20px_40px_-24px_rgba(79,70,229,0.65)]" 
                    : "text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <span>{tag}</span>
                {activeTag === tag && (
                  <motion.div layoutId="active-tag-pill" className="w-1.5 h-1.5 bg-indigo-400 rounded-full hidden md:block" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4">
            <Calendar size={14} />
            <span>时间筛选</span>
          </div>
          <div className="flex flex-wrap md:flex-col gap-2">
            {years.map(year => (
              <button 
                key={year} 
                onClick={() => setActiveYear(year)}
                className={cn(
                  "px-4 py-2 text-sm font-medium transition-all text-left rounded-lg",
                  activeYear === year
                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/12 dark:text-indigo-200"
                    : "text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                )}
              >
                {year === '全部' ? '全部年份' : `${year} 年`}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Right Content: Note List */}
      <main className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="text-sm text-slate-500 dark:text-slate-300 font-medium">
            <span className="text-slate-900 dark:text-white font-bold mr-1">{filteredNotes.length}</span> 篇文章
          </div>
          <button 
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowUpDown size={16} />
            <span>时间排序 {sortOrder === 'desc' ? '↓' : '↑'}</span>
          </button>
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, idx) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onNoteSelect(note.id)}
                className="group flex cursor-pointer flex-col gap-6 rounded-3xl border border-slate-100 bg-white p-4 transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 md:flex-row dark:border-slate-800/80 dark:bg-slate-900/72 dark:hover:border-indigo-500/30 dark:hover:shadow-[0_24px_60px_-34px_rgba(79,70,229,0.24)]"
              >
                {/* Image Placeholder */}
                <div className="w-full md:w-72 h-48 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                  {note.coverImage ? (
                    <img 
                      src={note.coverImage} 
                      alt={note.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600">
                      <FileText size={48} />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm backdrop-blur-sm dark:bg-slate-950/85 dark:text-indigo-200">
                    {note.category}
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-center py-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-3 leading-tight">
                    {note.title}
                  </h3>
                  <div className="mb-4 flex items-center gap-4 text-sm text-slate-400 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      <span>{format(new Date(note.lastModified), 'yyyy-MM-dd')}</span>
                    </div>
                    <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    <span className="hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">Read on Garden</span>
                  </div>
                  <div className="mt-auto flex items-center justify-end">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800/90 dark:text-slate-300 dark:group-hover:bg-indigo-500">
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

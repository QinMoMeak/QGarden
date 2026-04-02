import React, { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { Note } from '../types';
import { Search as SearchIcon, X, FileText, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SearchProps {
  notes: Note[];
  onSelect: (id: string) => void;
  isScrolled?: boolean;
}

export const Search: React.FC<SearchProps> = ({ notes, onSelect, isScrolled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Note[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = new Fuse(notes, {
    keys: ['title', 'content', 'tags', 'category'],
    threshold: 0.3,
  });

  useEffect(() => {
    if (query) {
      const searchResults = fuse.search(query).map(r => r.item);
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query, notes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg transition-all duration-300 text-sm border border-slate-200 dark:border-slate-700",
          isScrolled ? "p-2 md:px-3 md:py-1.5" : "px-3 py-1.5"
        )}
      >
        <SearchIcon size={16} />
        <span className={cn(
          "transition-all duration-300",
          isScrolled ? "hidden md:block" : "block"
        )}>
          搜索笔记...
        </span>
        {!isScrolled && (
          <kbd className="ml-4 px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-[10px] font-sans font-medium text-slate-400 dark:text-slate-500 hidden lg:block">
            ⌘K
          </kbd>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
                <SearchIcon className="text-slate-400 dark:text-slate-500 mr-3" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="搜索标题、内容、标签..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-lg"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 dark:text-slate-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((note) => (
                      <button
                        key={note.id}
                        onClick={() => {
                          onSelect(note.id);
                          setIsOpen(false);
                          setQuery('');
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors group"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-slate-100 font-medium">{note.title}</div>
                            <div className="text-slate-400 dark:text-slate-500 text-xs">{note.path}</div>
                          </div>
                        </div>
                        <CornerDownLeft size={16} className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                    没有找到匹配的笔记
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-600">
                    输入内容开始搜索...
                  </div>
                )}
              </div>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-bold">
                <div className="flex gap-4">
                  <span><kbd className="bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">ESC</kbd> 关闭</span>
                  <span><kbd className="bg-white dark:bg-slate-800 px-1 rounded border border-slate-200 dark:border-slate-700">ENTER</kbd> 选择</span>
                </div>
                <div>{results.length} 个结果</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

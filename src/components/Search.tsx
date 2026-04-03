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
          "flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 text-sm text-slate-500 transition-all duration-300 hover:bg-slate-200 dark:border-slate-700/80 dark:bg-slate-900/85 dark:text-slate-300 dark:hover:bg-slate-800/85",
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
          <kbd className="ml-4 hidden rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-sans font-medium text-slate-400 lg:block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800/90 dark:bg-slate-900/95 dark:shadow-[0_32px_80px_-36px_rgba(15,23,42,0.98)]"
            >
              <div className="flex items-center p-4 border-b border-slate-100 dark:border-slate-800">
                <SearchIcon className="mr-3 text-slate-400 dark:text-slate-400" size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="搜索标题、内容、标签..."
                  className="flex-1 border-none bg-transparent text-lg text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/90"
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
                        className="group flex w-full items-center justify-between rounded-xl p-3 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-500/10"
                      >
                        <div className="flex items-center gap-3 text-left">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-500 dark:bg-slate-800/90 dark:text-slate-400 dark:group-hover:bg-indigo-500/15 dark:group-hover:text-indigo-300">
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="text-slate-900 dark:text-slate-100 font-medium">{note.title}</div>
                            <div className="text-xs text-slate-400 dark:text-slate-400">{note.path}</div>
                          </div>
                        </div>
                        <CornerDownLeft size={16} className="text-slate-300 opacity-0 transition-opacity group-hover:opacity-100 dark:text-slate-500" />
                      </button>
                    ))}
                  </div>
                ) : query ? (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-400">
                    没有找到匹配的笔记
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 dark:text-slate-400">
                    输入内容开始搜索...
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
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

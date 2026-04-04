import React, { useState, useEffect } from 'react';
import { NoteRenderer } from './components/NoteRenderer';
import { Search } from './components/Search';
import { CategoryGrid } from './components/CategoryGrid';
import { CategoryView } from './components/CategoryView';
import { SAMPLE_NOTES } from './data/notes';
import { Github, Share2, Home, ChevronLeft, LayoutGrid, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AppRouteState, buildUrlForRoute, getHomeRoute, resolveRouteFromSearch } from './lib/navigation';

export default function App() {
  const [route, setRoute] = useState<AppRouteState>(() => {
    if (typeof window === 'undefined') {
      return getHomeRoute();
    }

    return resolveRouteFromSearch(window.location.search, SAMPLE_NOTES);
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const { activeNoteId, activeCategory, view } = route;

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const activeNote = SAMPLE_NOTES.find(n => n.id === activeNoteId);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(resolveRouteFromSearch(window.location.search, SAMPLE_NOTES));
      window.scrollTo({ top: 0, behavior: 'auto' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigateToRoute = (nextRoute: AppRouteState, scrollBehavior: ScrollBehavior = 'smooth') => {
    const nextUrl = buildUrlForRoute(nextRoute);
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl !== nextUrl) {
      window.history.pushState({}, '', nextUrl);
    }

    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: scrollBehavior });
  };

  const handleNoteSelect = (id: string) => {
    const note = SAMPLE_NOTES.find((item) => item.id === id);
    if (!note) return;

    navigateToRoute({
      view: 'note',
      activeNoteId: note.id,
      activeCategory: note.category,
    });
  };

  const handleCategorySelect = (category: string) => {
    navigateToRoute({
      view: 'category',
      activeCategory: category,
      activeNoteId: null,
    });
  };

  const handleGoHome = () => {
    navigateToRoute(getHomeRoute());
  };

  const handleBackToCategory = () => {
    if (activeCategory) {
      navigateToRoute({
        view: 'category',
        activeCategory,
        activeNoteId: null,
      });
      return;
    }

    navigateToRoute(getHomeRoute());
  };

  return (
    <div className={cn(
      "min-h-screen font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900 selection:text-indigo-900 dark:selection:text-indigo-100 transition-colors duration-300",
      isDarkMode
        ? "dark bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_32%),linear-gradient(180deg,_#060816_0%,_#0b1020_100%)] text-slate-50"
        : "bg-white text-slate-900"
    )}>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-14 border-b backdrop-blur-md md:h-16",
          isDarkMode
            ? "border-slate-800/60 bg-[rgba(8,12,24,0.88)]"
            : "border-slate-200/60 bg-[rgba(255,255,255,0.88)]"
        )}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={handleGoHome}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 group-hover:scale-110 transition-transform shrink-0">
                <LayoutGrid size={16} />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                QGarden
              </span>
            </button>

            {view !== 'home' && (
              <>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2" />
                <button
                  onClick={view === 'note' ? handleBackToCategory : handleGoHome}
                  className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors whitespace-nowrap"
                >
                  <ChevronLeft size={16} />
                  <span>{view === 'note' ? (activeCategory || '返回') : '返回首页'}</span>
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-3">
            <Search notes={SAMPLE_NOTES} onSelect={handleNoteSelect} isScrolled={isScrolled} />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-300 transition-colors hidden sm:flex">
              <Share2 size={18} />
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg text-slate-500 dark:text-slate-300 transition-colors"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content jump */}
      <div className="h-16" />

      {/* Main Content */}
      <main className="relative">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryGrid 
                onCategorySelect={handleCategorySelect}
              />
            </motion.div>
          )}
          {view === 'category' && activeCategory && (
            <motion.div
              key="category"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryView 
                category={activeCategory} 
                notes={SAMPLE_NOTES} 
                onNoteSelect={handleNoteSelect} 
              />
            </motion.div>
          )}
          {view === 'note' && activeNote && (
            <motion.div
              key="note"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <NoteRenderer note={activeNote} onNoteSelect={handleNoteSelect} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-100 bg-slate-50/50 py-12 dark:border-slate-800/80 dark:bg-slate-950/90">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg border border-transparent bg-slate-200 dark:border-slate-700/80 dark:bg-slate-800/90" />
            <span className="text-sm font-bold text-slate-400 dark:text-slate-300">QGarden</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-400 dark:text-slate-400">
            <button onClick={handleGoHome} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">首页</button>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">关于</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">归档</a>
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            © 2024 Built with Passion for Knowledge
          </div>
        </div>
      </footer>
    </div>
  );
}

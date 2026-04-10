import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import type { ParsedHeading } from '../lib/headings';

interface TableOfContentsProps {
  headings: ParsedHeading[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId('');
      return;
    }

    const getCurrentHeading = () => {
      const viewportAnchor = 180;
      const visibleCandidates: Array<{ id: string; level: number; top: number }> = [];
      const passedCandidates: Array<{ id: string; level: number; top: number }> = [];

      headings.forEach((heading) => {
        const el = document.getElementById(heading.id);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;

        if (rect.top <= viewportAnchor && rect.bottom > 0) {
          visibleCandidates.push({ id: heading.id, level: heading.level, top: rect.top });
        }

        if (absoluteTop <= window.scrollY + viewportAnchor) {
          passedCandidates.push({ id: heading.id, level: heading.level, top: absoluteTop });
        }
      });

      if (visibleCandidates.length > 0) {
        visibleCandidates.sort((a, b) => {
          if (b.level !== a.level) return b.level - a.level;
          return Math.abs(a.top) - Math.abs(b.top);
        });
        setActiveId(visibleCandidates[0].id);
        return;
      }

      if (passedCandidates.length > 0) {
        passedCandidates.sort((a, b) => {
          if (b.top !== a.top) return b.top - a.top;
          return b.level - a.level;
        });
        setActiveId(passedCandidates[0].id);
        return;
      }

      setActiveId(headings[0]?.id ?? '');
    };

    getCurrentHeading();
    window.addEventListener('scroll', getCurrentHeading, { passive: true });
    window.addEventListener('resize', getCurrentHeading);

    return () => {
      window.removeEventListener('scroll', getCurrentHeading);
      window.removeEventListener('resize', getCurrentHeading);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="scrollbar-hidden fixed right-6 top-24 z-30 hidden max-h-[calc(100vh-7.5rem)] w-44 overflow-y-auto rounded-2xl border border-slate-200/70 bg-white/88 p-4 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.18)] backdrop-blur-md xl:block dark:border-slate-800/80 dark:bg-slate-950/78 dark:shadow-[0_24px_60px_-34px_rgba(2,6,23,0.78)]">
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">目录</h4>
      <ul className="space-y-3">
        {headings.map((heading) => (
          <li 
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={cn(
                "text-sm transition-all duration-200 block border-l-2 py-0.5 pl-3",
                activeId === heading.id
                  ? "text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 font-medium"
                  : "text-slate-400 dark:text-slate-500 border-transparent hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-200 dark:hover:border-slate-700"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

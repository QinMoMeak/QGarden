import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import type { ParsedHeading } from '../lib/headings';

interface TableOfContentsProps {
  headings: ParsedHeading[];
}

function formatTocText(text: string) {
  return text
    .replace(/^【(.+?)】/, '$1')
    .replace(/[（(].*?[）)]$/, '')
    .trim();
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) {
      setActiveId('');
      return;
    }

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter(Boolean) as HTMLElement[];

    if (headingElements.length === 0) {
      setActiveId('');
      return;
    }

    const updateActiveHeading = () => {
      const inView = headingElements
        .map((element) => ({
          id: element.id,
          top: element.getBoundingClientRect().top,
          bottom: element.getBoundingClientRect().bottom,
        }))
        .filter((entry) => entry.top <= 180 && entry.bottom > 0)
        .sort((a, b) => b.top - a.top);

      if (inView[0]?.id) {
        setActiveId(inView[0].id);
        return;
      }

      const upcoming = headingElements
        .map((element) => ({
          id: element.id,
          top: element.getBoundingClientRect().top,
        }))
        .filter((entry) => entry.top > 0)
        .sort((a, b) => a.top - b.top);

      setActiveId(upcoming[0]?.id ?? headings[0]?.id ?? '');
    };

    const observer = new IntersectionObserver(updateActiveHeading, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: [0, 0.1, 0.25, 0.5, 1],
    });

    headingElements.forEach((element) => observer.observe(element));
    updateActiveHeading();
    window.addEventListener('resize', updateActiveHeading);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateActiveHeading);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 96;
    const top = element.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  };

  return (
    <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <nav aria-label="文章目录" className="scrollbar-hidden text-sm">
        <div className="mb-3 text-xs font-medium tracking-[0.18em] text-slate-400 dark:text-slate-500">
          目录
        </div>
        <ul className="space-y-1 border-l border-slate-200/80 pl-3 dark:border-slate-800/80">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <li
                key={heading.id}
                className={cn(
                  heading.level === 1 && 'pl-0',
                  heading.level === 2 && 'pl-3',
                  heading.level === 3 && 'pl-6'
                )}
              >
                <button
                  type="button"
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'relative block w-full truncate py-1 text-left transition-colors duration-200',
                    heading.level === 1 && 'text-[0.95rem] font-medium',
                    heading.level === 3 && 'text-[13px]',
                    isActive
                      ? 'font-medium text-slate-900 dark:text-slate-100'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
                  )}
                >
                  {isActive && (
                    <span className="absolute -left-3 top-1/2 h-5 w-px -translate-y-1/2 bg-slate-700 dark:bg-slate-200" />
                  )}
                  {formatTocText(heading.text)}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};

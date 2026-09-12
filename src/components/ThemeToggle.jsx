import React, { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('itsa-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('itsa-theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="group relative inline-flex h-9 w-[68px] items-center border border-foreground/25 bg-surface px-1 transition-colors hover:border-foreground/60 cursor-pointer"
    >
      <span
        aria-hidden="true"
        className="absolute h-7 w-7 bg-foreground transition-all duration-300 ease-out"
        style={{ left: theme === 'dark' ? '36px' : '4px' }}
      ></span>
      <span
        aria-hidden="true"
        className={`relative z-10 grid h-7 w-7 place-items-center font-mono text-[10px] transition-colors ${
          theme === 'light' ? 'text-background' : 'text-muted-foreground'
        }`}
      >
        ☀
      </span>
      <span
        aria-hidden="true"
        className={`relative z-10 ml-auto grid h-7 w-7 place-items-center font-mono text-[10px] transition-colors ${
          theme === 'dark' ? 'text-background' : 'text-muted-foreground'
        }`}
      >
        ☾
      </span>
    </button>
  );
}

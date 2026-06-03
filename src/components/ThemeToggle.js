import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="relative p-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="Toggle Theme"
        >
            <div className="relative w-6 h-6">
                <Sun
                    className={`absolute top-0 left-0 w-6 h-6 text-amber-500 transition-all duration-300 rotate-0 scale-100 ${theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : ''
                        }`}
                />
                <Moon
                    className={`absolute top-0 left-0 w-6 h-6 text-blue-400 transition-all duration-300 rotate-90 scale-0 opacity-0 ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : ''
                        }`}
                />
            </div>
        </button>
    );
};

export default ThemeToggle;

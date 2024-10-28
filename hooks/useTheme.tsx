'use client';

import { useState, useEffect } from 'react';

export const useTheme = () => {
  // Initialize state without localStorage
  const [darkMode, setDarkMode] = useState(false);

  // On mount, check localStorage and update state
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setDarkMode(storedTheme === "dark");
  }, []);

  // Handle theme changes
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  return { darkMode, toggleDarkMode };
};

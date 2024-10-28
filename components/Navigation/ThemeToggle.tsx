import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  darkMode: boolean;
  onToggle: () => void;
}

export const ThemeToggle = ({ darkMode, onToggle }: ThemeToggleProps) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onToggle}
    className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
  >
    {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    <span className="sr-only">Toggle dark mode</span>
  </Button>
);
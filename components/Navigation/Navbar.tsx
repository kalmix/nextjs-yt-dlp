import { Youtube, Github } from "lucide-react";
import { ThemeToggle } from "@/components/Navigation/ThemeToggle";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  darkMode: boolean;
  onThemeToggle: () => void;
}

export const Navbar = ({ darkMode, onThemeToggle }: NavbarProps) => (
  <div className="sticky top-0 z-50 w-full">
    <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300 ease-in-out border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <Youtube className="h-6 w-6 text-gray-500 dark:text-gray-200" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                nextjs-yt-dlp
              </span>
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle darkMode={darkMode} onToggle={onThemeToggle} />
            <a
              href="https://github.com/kalmix"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </div>
    </nav>
  </div>
);

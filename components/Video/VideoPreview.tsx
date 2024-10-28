import { Play, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPreviewProps {
  downloadUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  darkMode: boolean;
}

export const VideoPreview = ({ downloadUrl, thumbnailUrl, title, darkMode }: VideoPreviewProps) => (
  <div
    className={cn(
      "border-4 border-dashed rounded-lg h-64 mb-6 overflow-hidden transition-all duration-300 ease-in-out",
      darkMode ? "border-gray-700 bg-gray-800" : "border-gray-300 bg-white"
    )}
  >
    {downloadUrl ? (
      <video src={downloadUrl} controls className="w-full h-full object-cover">
        Your browser does not support the video tag.
      </video>
    ) : thumbnailUrl ? (
      <div className="relative w-full h-full">
        <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Check className="h-16 w-16 text-white opacity-75" />
        </div>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 transition-colors duration-300 ease-in-out">
        <Play className="h-12 w-12 mb-2" />
        <span>Video Preview</span>
      </div>
    )}
  </div>
);
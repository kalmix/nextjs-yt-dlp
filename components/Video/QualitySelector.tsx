import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/lib/utils";

interface QualitySelectorProps {
  quality: string;
  onQualityChange: (value: string) => void;
  darkMode: boolean;
}

export const QualitySelector = ({
  quality,
  onQualityChange,
  darkMode,
}: QualitySelectorProps) => (
  <Select value={quality} onValueChange={onQualityChange}>
    <SelectTrigger
      className={cn(
        "w-full transition-colors duration-300 ease-in-out",
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      )}
    >
      <SelectValue placeholder="Select quality" />
    </SelectTrigger>
    <SelectContent
      className={cn(
        "w-full transition-colors duration-300 ease-in-out",
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
      )}
    >
      <SelectItem value=".mp3">mp3: Audio Only</SelectItem>
      <SelectItem value="360p">360p</SelectItem>
      <SelectItem value="480p">480p</SelectItem>
      <SelectItem value="720p">720p</SelectItem>
      <SelectItem value="1080p">1080p</SelectItem>
    </SelectContent>
  </Select>
);

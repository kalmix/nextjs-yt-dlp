import { useState } from 'react';
import { VideoMetadata } from '@/types/video';
import { API_BASE_URL } from '@/config/constants'

interface UseVideoDownloaderProps {
  onError: (message: string) => void;
}

export const useVideoDownloader = ({ onError }: UseVideoDownloaderProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [quality, setQuality] = useState("720p");
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata>({
    title: "",
    thumbnailUrl: "",
    downloadUrl: "",
  });
  const [isFetching, setIsFetching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleError = (error: unknown) => {
    return error instanceof Error ? error.message : String(error);
  };

  const fetchMetadata = async () => {
    if (!videoUrl) {
      onError("Please enter a video URL");
      return;
    }
    if (!videoUrl.includes("youtu")) {
      onError("Please enter a valid YouTube URL");
      return;
    }

    setIsFetching(true);
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-metadata`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setVideoMetadata({
        title: data.title,
        thumbnailUrl: data.thumbnailUrl,
        downloadUrl: "",
      });
    } catch (err) {
      onError(`Error fetching video metadata: ${handleError(err)}. Is the server running?`);
    } finally {
      setIsFetching(false);
    }
  };

  const downloadVideo = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: videoUrl, quality }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setVideoMetadata(prev => ({ ...prev, downloadUrl: data.downloadUrl }));
    } catch (err) {
      onError(`Error downloading video: ${handleError(err)}. Is the server running?`);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    videoUrl,
    setVideoUrl,
    quality,
    setQuality,
    videoMetadata,
    isFetching,
    isDownloading,
    fetchMetadata,
    downloadVideo,
  };
};
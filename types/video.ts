export interface VideoMetadata {
    title: string;
    thumbnailUrl: string;
    downloadUrl?: string;
  }


  export interface UrlItem {
    id: number;
    url: string;
  }
  
  export interface QueueItem extends UrlItem {
    status: 'pending' | 'completed' | 'failed';
    error?: string;
  }
  
  export interface VideoDownloaderProps {
    onError: (error: string) => void;
  }
  
  export interface UseVideoDownloaderReturn {
    videoUrl: string;
    setVideoUrl: (url: string) => void;
    quality: string;
    setQuality: (quality: string) => void;
    videoMetadata: VideoMetadata;
    isFetching: boolean;
    isDownloading: boolean;
    fetchMetadata: () => Promise<void>;
    downloadVideo: () => Promise<void>;
  }
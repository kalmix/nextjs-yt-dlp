"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, LinkIcon, Loader, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerStatusToast } from "@/components/ui/server-status";
import { Console } from "@/components/ui/console";
import { Navbar } from "@/components/Navigation/Navbar";
import { VideoPreview } from "./VideoPreview";
import { QualitySelector } from "./QualitySelector";
import { useTheme } from "@/hooks/useTheme";
import { useVideoDownloader } from "@/hooks/useVideoDownloader";
import { cn } from "@/lib/utils";

export function VideoDownloader() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [error, setError] = useState("");

  const {
    videoUrl,
    setVideoUrl,
    quality,
    setQuality,
    videoMetadata,
    isFetching,
    isDownloading,
    fetchMetadata,
    downloadVideo,
  } = useVideoDownloader({ onError: setError });

  return (
    <div
      className={cn(
        "min-h-screen transition-colors duration-300 ease-in-out ",
        darkMode ? "dark bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      )}
    >
      <Navbar darkMode={darkMode} onThemeToggle={toggleDarkMode} />

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <ServerStatusToast darkMode={darkMode} />
        <div className="px-4 py-6 sm:px-0 space-y-6">
          <div className="flex items-center space-x-2">
            <Input
              type="url"
              placeholder="Enter YouTube URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="flex-grow transition-colors duration-300 ease-in-out"
            />
            <Button
              variant="outline"
              onClick={fetchMetadata}
              disabled={isFetching}
              className={cn(
                "transition-colors duration-300 ease-in-out",
                darkMode
                  ? "text-gray-100 border-gray-500 hover:bg-gray-700 bg-gray-800"
                  : "text-gray-900 border-gray-300 hover:bg-gray-200"
              )}
            >
              <LinkIcon className={cn("mr-2 h-4 w-4", darkMode ? "text-gray-100" : "text-gray-700")} />
              {isFetching ? "Fetching..." : "Fetch"}
            </Button>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className={cn(
                "mb-6 transition-all duration-300 ease-in-out",
                darkMode ? "border-white text-red-600" : "border-red-500 text-red-700"
              )}
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <VideoPreview
            downloadUrl={videoMetadata.downloadUrl}
            thumbnailUrl={videoMetadata.thumbnailUrl}
            title={videoMetadata.title}
            darkMode={darkMode}
          />

          {videoMetadata.title ? (
            <h2
              className={cn(
                "text-xl mb-4 font-semibold tracking-tight scroll-m-20 transition-opacity duration-300 ease-in-out",
                darkMode ? "text-white" : "text-gray-900"
              )}
              style={{ opacity: videoMetadata.title ? 1 : 0 }}
            >
              {videoMetadata.title}
            </h2>
          ) : (
            <div
              className={cn(
                "text-xl mb-4 font-semibold tracking-tight scroll-m-20 opacity-50",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              Video Title...
            </div>
          )}

          <div className="space-y-4">
            <QualitySelector
              quality={quality}
              onQualityChange={setQuality}
              darkMode={darkMode}
            />

            <Button
              onClick={downloadVideo}
              disabled={isDownloading || !videoUrl || !videoMetadata.thumbnailUrl}
              variant="outline"
              className={cn(
                "w-full transition-colors duration-300 ease-in-out",
                darkMode
                  ? "text-gray-100 border-gray-500 hover:bg-gray-700 bg-gray-800"
                  : "text-gray-900 border-gray-300 hover:bg-gray-200"
              )}
            >
              {isDownloading ? <Loader className="animate-spin h-4 w-4 mr-2" /> : <Download className="mr-2 h-4 w-4" />}
              {isDownloading ? "Downloading..." : "Download"}
            </Button>

            <div className="my-6">
              <Console darkMode={darkMode}/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import SyntaxHighlighter from "react-syntax-highlighter";
import { arduinoLight, atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { Terminal, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  content: string;
  type: 'command' | 'output' | 'error' | 'info';
  timestamp: string;
}

interface ConsoleProps {
  darkMode?: boolean;
}

export function Console({ darkMode = true }: ConsoleProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: NodeJS.Timeout;
    const connectWebSocket = () => {
      wsRef.current = new WebSocket("ws://localhost:8080");

      wsRef.current.onopen = () => {
        setConnectionState('connected');
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.log) {
          const newLog: LogEntry = {
            id: Date.now().toString(),
            content: data.log,
            type: detectLogType(data.log),
            timestamp: new Date().toLocaleTimeString()
          };
          setLogs(prevLogs => [...prevLogs, newLog]);
        }
      };

      wsRef.current.onerror = () => {
        if (connectionState === 'connecting') {
          return;
        }
        setConnectionState('error');
        const errorLog: LogEntry = {
          id: Date.now().toString(),
          content: "WebSocket connection error. Check if the server is running.",
          type: 'error',
          timestamp: new Date().toLocaleTimeString()
        };
        setLogs(prevLogs => [...prevLogs, errorLog]);
      };

      wsRef.current.onclose = () => {
        if (connectionState === 'connected') {
          setConnectionState('error');
        }
        reconnectTimeout = setTimeout(connectWebSocket, 5000);
      };
    };

    connectWebSocket();

    return () => {
      clearTimeout(reconnectTimeout);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isAtBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
      setAutoScroll(isAtBottom);
      setShowScrollButton(!isAtBottom && logs.length > 0);
    };

    viewport.addEventListener('scroll', handleScroll);
    return () => viewport.removeEventListener('scroll', handleScroll);
  }, [logs.length]);

  useEffect(() => {
    if (autoScroll && viewportRef.current) {
      const viewport = viewportRef.current;
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [logs, autoScroll]);

  const scrollToBottom = () => {
    if (viewportRef.current) {
      const viewport = viewportRef.current;
      viewport.scrollTop = viewport.scrollHeight;
      setAutoScroll(true);
    }
  };

  const detectLogType = (content: string): LogEntry['type'] => {
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('error') || lowerContent.includes('failed')) {
      return 'error';
    }
    if (lowerContent.includes('running') || lowerContent.includes('downloading')) {
      return 'command';
    }
    if (lowerContent.includes('success') || lowerContent.includes('downloaded')) {
      return 'info';
    }
    return 'output';
  };

  const getLogStyle = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return 'bash';
      case 'command':
        return 'shell';
      case 'info':
        return 'javascript';
      default:
        return 'plaintext';
    };
  };

  const getLogBackground = (type: LogEntry['type']) => {
    switch (type) {
      case 'error':
        return cn(
          'transition-colors duration-300 ease-in-out',
          darkMode ? 'bg-red-950/50' : 'bg-red-50'
        );
      case 'command':
        return cn(
          'transition-colors duration-300 ease-in-out',
          darkMode ? 'bg-blue-950/50' : 'bg-blue-50'
        );
      case 'info':
        return cn(
          'transition-colors duration-300 ease-in-out',
          darkMode ? 'bg-green-950/50' : 'bg-green-50'
        );
      default:
        return cn(
          'transition-colors duration-300 ease-in-out',
          darkMode ? 'bg-gray-800' : 'bg-white'
        );
    }
  };

  const getConnectionMessage = () => {
    switch (connectionState) {
      case 'connecting':
        return 'Connecting to server...';
      case 'error':
        return 'Connection lost. Attempting to reconnect...';
      default:
        return 'Waiting for logs...';
    }
  };

  return (
    <div className="relative w-full max-w-full space-y-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Terminal className={cn(
            "h-5 w-5 transition-colors duration-300 ease-in-out",
            darkMode ? "text-gray-400" : "text-gray-500"
          )} />
          <h3 className={cn(
            "font-semibold text-sm transition-colors duration-300 ease-in-out",
            darkMode ? "text-white" : "text-gray-900"
          )}>Server Logs</h3>
        </div>
        <span className={cn(
          "text-xs transition-colors duration-300 ease-in-out",
          darkMode ? "text-gray-400" : "text-gray-500"
        )}>
          {logs.length} entries
        </span>
      </div>
      
      <div className="relative">
        <ScrollArea 
          ref={scrollAreaRef}
          className={cn(
            "relative p-4 h-64 rounded-lg border transition-colors duration-300 ease-in-out",
            darkMode 
              ? "bg-gray-900 text-white border-gray-700" 
              : "bg-gray-100 text-gray-900 border-gray-300"
          )}
        >
          <div 
            ref={viewportRef}
            className="space-y-2 min-w-[200px]"
          >
            {logs.length > 0 ? (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={cn(
                    "rounded-md shadow-sm border overflow-hidden transition-colors duration-300 ease-in-out",
                    darkMode ? "border-gray-700" : "border-gray-200",
                    getLogBackground(log.type)
                  )}
                >
                  <div className={cn(
                    "px-2 py-1 border-b sticky top-0 transition-colors duration-300 ease-in-out flex justify-between",
                    darkMode 
                      ? "bg-white/5 border-gray-700" 
                      : "bg-black/5 border-gray-200"
                  )}>
                    <span className={cn(
                      "text-xs transition-colors duration-300 ease-in-out",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {log.timestamp}
                    </span>
                    <span className={cn(
                      "text-xs transition-colors duration-300 ease-in-out ml-2",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}>
                      {log.type}
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <SyntaxHighlighter
                      language={getLogStyle(log.type)}
                      style={darkMode ? atomOneDark : arduinoLight}
                      customStyle={{
                        margin: 0,
                        padding: '0.5rem',
                        background: 'transparent',
                        fontSize: '0.75rem',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        minWidth: '100%'
                      }}
                      wrapLines={true}
                      wrapLongLines={true}
                    >
                      {log.content}
                    </SyntaxHighlighter>
                  </div>
                </div>
              ))
            ) : (
              <div className={cn(
                "flex items-center justify-center h-32 transition-colors duration-300 ease-in-out",
                darkMode ? "text-gray-400" : "text-gray-500"
              )}>
                <p>{getConnectionMessage()}</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {showScrollButton && (
          <div className="absolute bottom-6 right-6 z-50">
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "shadow-lg transition-colors duration-300 ease-in-out",
                darkMode ? "bg-gray-800" : "bg-white"
              )}
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4 mr-1" />
              Latest
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Console;
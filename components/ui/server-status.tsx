import React, { useEffect, useState, useRef, useCallback } from "react";
import { toast, Toaster } from "sonner";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { API_BASE_URL } from "@/config/constants";

interface ServerStatusToastProps {
  darkMode: boolean;
}

interface PingResponse {
  success: boolean;
  pingTime?: number;
}

export function ServerStatusToast({ darkMode }: ServerStatusToastProps) {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [pingTime, setPingTime] = useState<number | null>(null);
  const toastIdRef = useRef<string | number | null>(null);
  const activeToastDataRef = useRef<{
    type: 'success' | 'error' | 'info';
    title: string;
    description: string;
  } | null>(null);

  const getToastStyle = useCallback(() => ({
    background: darkMode ? "#1f2937" : "#fff",
    color: darkMode ? "#f9fafb" : "#111827",
    border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
  }), [darkMode]);

  const showToast = useCallback((
    type: 'success' | 'error' | 'info',
    title: string,
    description: string,
    icon?: React.ReactNode
  ) => {
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current);
    }

    activeToastDataRef.current = { type, title, description };
    
    toastIdRef.current = toast[type](title, {
      description,
      icon,
      style: getToastStyle(),
      duration: type === 'success' ? 5000 : undefined
    });
  }, [getToastStyle]);

  const checkServerStatus = useCallback(async () => {
    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE_URL}/ping`);
      const endTime = performance.now();
      
      if (response.ok) {
        const data: PingResponse = await response.json();
        const newStatus = data.success;
        const currentPingTime = data.pingTime || Math.round(endTime - startTime);

        setPingTime(currentPingTime);

        if (newStatus !== isOnline || isOnline === null) {
          setIsOnline(newStatus);
          if (newStatus) {
            showToast(
              'success',
              "Server is Online",
              `Ping to YouTube: ${currentPingTime}ms`,
              <FaCheckCircle className="text-green-500" />
            );
          } else {
            showToast(
              'error',
              "Server is Offline",
              "The server is no longer reachable.",
              <FaTimesCircle className="text-red-500" />
            );
          }
        }
      } else {
        if (isOnline !== false) {
          setIsOnline(false);
          setPingTime(null);
          showToast(
            'error',
            "Server is Offline",
            "The server is no longer reachable.",
            <FaTimesCircle className="text-red-500" />
          );
        }
      }
    } catch (error) {
      if (isOnline !== false) {
        setIsOnline(false);
        setPingTime(null);
        showToast(
          'error',
          "Server is Offline",
          "The server is no longer reachable.",
          <FaTimesCircle className="text-red-500" />
        );
      }
    }
  }, [isOnline, showToast]);

  // Handle theme changes
  useEffect(() => {
    // If there's an active toast, recreate it with the new theme
    if (activeToastDataRef.current) {
      const { type, title, description } = activeToastDataRef.current;
      const icon = type === 'success' 
        ? <FaCheckCircle className="text-green-500" />
        : <FaTimesCircle className="text-red-500" />;
        
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
      
      toastIdRef.current = toast[type](title, {
        description,
        icon,
        style: getToastStyle(),
        duration: type === 'success' ? 5000 : undefined
      });
    }
  }, [darkMode, getToastStyle]);

  useEffect(() => {
    checkServerStatus();
    const intervalId = setInterval(checkServerStatus, 3000000);
    
    return () => {
      clearInterval(intervalId);
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }
    };
  }, [checkServerStatus]);

  return (
    <Toaster 
      position="bottom-right"
      closeButton
      richColors
      toastOptions={{
        style: getToastStyle(),
      }}
    />
  );
}
"use client";

import { useState } from "react";

interface FileStorageProps {
  userId: string;
  file: File;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

export const useFileStorage = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async ({ userId, file, onSuccess, onError }: FileStorageProps) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // In a real implementation, this would upload to a storage service
      // For now, we'll simulate the upload process
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 10;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 300);

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      // Generate a fake URL for the uploaded file
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const simulatedUrl = `/api/files/${userId}/${timestamp}-${file.name.replace(/\s+/g, '-')}`;
      
      clearInterval(progressInterval);
      setProgress(100);
      setIsUploading(false);
      
      if (onSuccess) onSuccess(simulatedUrl);
      return simulatedUrl;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during upload';
      setError(errorMessage);
      setIsUploading(false);
      if (onError) onError(errorMessage);
      throw err;
    }
  };

  return {
    uploadFile,
    isUploading,
    progress,
    error,
  };
};

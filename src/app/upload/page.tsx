"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone"; 
import type { FileWithPath } from "react-dropzone"; 
import Link from "next/link";
import { useRouter } from 'next/navigation'; 

export default function UploadPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter(); 

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => { 
    setUploadError(null);
    
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/tiff", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const invalidFiles = acceptedFiles.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setUploadError("Invalid file format. Please upload PDF, images (JPEG, PNG, TIFF), or Excel files.");
      return;
    }
    
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/tiff': ['.tiff', '.tif'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  // Correct handleUpload for Files API approach
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    setUploadError(null);

    const file = files[0];
    
    // Send the file to the temporary upload endpoint
    const formData = new FormData();
    formData.append('file', file); // Append the actual File object

    try {
      console.log("[UploadPage] Sending file to /api/upload-temp...");
      const response = await fetch('/api/upload-temp', { // Endpoint to upload file to Google
        method: 'POST',
        body: formData, // Send FormData
      });

      const result = await response.json();
      console.log("[UploadPage] Received response from /api/upload-temp:", result);

      if (!response.ok || !result.success || !result.fileId) {
        throw new Error(result.error || `Failed to upload file (status ${response.status})`);
      }

      const tempFileId = result.fileId; // This is the Google file resource name (e.g., files/abc-123)
      console.log("[UploadPage] File uploaded temporarily with Google ID:", tempFileId);
      
      // Navigate to analysis page with the temporary file ID
      console.log(`[UploadPage] Navigating to /analysis?fileId=${tempFileId}`);
      router.push(`/analysis?fileId=${tempFileId}`); 

    } catch (err) {
      console.error("[UploadPage] Error uploading file:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload file.");
    } finally {
       setIsUploading(false); // Ensure loading state is turned off
    }
  };

  return (
    <ProtectedRoute>
      <Layout
        homeHref="/dashboard"
        headerRight={
          <Button variant="ghost" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        }
      >
        <div className="container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Upload Lab Reports</h1>
          </div>

          <div className="grid gap-6">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
              <p className="text-muted-foreground mb-6">
                Upload your lab reports to get AI-powered analysis and easy-to-understand explanations.
                We support PDF, images (JPEG, PNG, TIFF), and Excel files.
              </p>
              
              <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                {isDragActive ? (
                  <p className="text-primary">Drop the files here...</p>
                ) : (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mx-auto mb-4 text-muted-foreground"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /> 
                      <polyline points="17 8 12 3 7 8" /> 
                      <line x1="12" y1="3" x2="12" y2="15" /> 
                    </svg>
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPEG, PNG, TIFF, or Excel files
                    </p>
                  </div>
                )}
              </div>
              
              {uploadError && (
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
                  {uploadError}
                </div>
              )}
              
              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Selected Files:</h3>
                  <ul className="space-y-2">
                    {files.map((file) => ( 
                      <li key={file.name} className="text-sm flex items-center gap-2 p-2 bg-secondary/20 rounded"> 
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /> 
                          <polyline points="14 2 14 8 20 8" /> 
                        </svg>
                        {file.name} ({(file.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className="mt-4 w-full" 
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /> 
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /> 
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      "Analyze with AI"
                    )}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="p-6 rounded-lg border border-border bg-card">
              <h2 className="text-xl font-semibold mb-4">Tips for Best Results</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary mt-0.5"
                  >
                    <polyline points="9 11 12 14 22 4" /> 
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /> 
                  </svg>
                  Ensure images are clear and well-lit for better text recognition
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary mt-0.5"
                  >
                    <polyline points="9 11 12 14 22 4" /> 
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /> 
                  </svg>
                  PDF files should not be password protected
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary mt-0.5"
                  >
                    <polyline points="9 11 12 14 22 4" /> 
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /> 
                  </svg>
                  Excel files should have lab results in a structured format
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary mt-0.5"
                  >
                    <polyline points="9 11 12 14 22 4" /> 
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /> 
                  </svg>
                  For best results, upload the complete lab report rather than partial pages
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

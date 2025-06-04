"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout";
import Link from "next/link";
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { useEffect, useState } from "react";

interface AnalysisResult {
  success: boolean;
  analysis?: string;
  timestamp?: string;
  error?: string;
}

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const searchParams = useSearchParams(); // Hook to get URL params
  const fileId = searchParams.get('fileId'); // Get fileId outside useEffect

  useEffect(() => {
    const performAnalysis = async () => {
      setIsAnalyzing(true); 
      setAnalysisResult(null); 

      // fileId is accessed from the outer scope
      if (!fileId) { 
        console.error("No fileId found in URL query parameters (inside performAnalysis)."); 
        setAnalysisResult({ success: false, error: "No file identifier found. Please upload again." });
        setIsAnalyzing(false);
        return; // Exit if no fileId
      }

      try {
        // Call the analyze API route, passing the fileId
        console.log(`[AnalysisPage] Sending request to /api/analyze with fileId: ${fileId}`);
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileId: fileId }), // Send the fileId
        });

        const result: AnalysisResult = await response.json();
        console.log("[AnalysisPage] Received response:", result);

        if (!response.ok) {
          console.error("[AnalysisPage] API Error:", result);
          setAnalysisResult({ 
            success: false, 
            error: result.error || `Request failed with status ${response.status}` 
          });
        } else {
          setAnalysisResult(result);
        }
        
        setIsAnalyzing(false);
      } catch (error) {
        console.error("[AnalysisPage] Fetch Error:", error);
        setAnalysisResult({
          success: false,
          error: error instanceof Error ? error.message : "An unknown error occurred",
        });
        setIsAnalyzing(false);
      }
    };

    // Perform analysis only if fileId is present (check the outer scope variable)
    if (fileId) {
      performAnalysis();
    } else {
      // Handle the case where the page is loaded without a fileId
      console.error("[AnalysisPage] Page loaded without fileId in URL.");
      setIsAnalyzing(false); 
      setAnalysisResult({ success: false, error: "No file specified for analysis." });
    }
    // Add fileId to the dependency array
  }, [fileId]); 

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
            <h1 className="text-3xl font-bold">Analysis Results</h1>
          </div>

          {isAnalyzing ? (
            <div className="p-12 rounded-lg border border-border bg-card flex flex-col items-center justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6"></div>
              <h2 className="text-xl font-semibold mb-2">Analyzing Your Lab Report</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Our AI is processing your document to extract and analyze the data.
                This may take a moment depending on the complexity of your report.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {analysisResult?.success ? (
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h2 className="text-xl font-semibold mb-4">Lab Report Analysis</h2>
                  <div className="prose prose-invert max-w-none">
                    {/* Ensure analysis is treated as string before split */}
                    {(analysisResult.analysis ?? '').split('\n').map((line, index) => (
                      <p key={index}>{line || '\u00A0'}</p> // Render non-breaking space for empty lines
                    ))}
                  </div>
                  
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <Button asChild>
                      <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/upload">Upload Another Report</Link>
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link href="/trends">View Trends</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-lg border border-border bg-card">
                  <h2 className="text-xl font-semibold mb-4 text-destructive">Analysis Error</h2>
                  <p className="text-muted-foreground mb-6">
                    We encountered an error while analyzing your lab report. Please try again or contact support if the issue persists.
                  </p>
                  <p className="p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm mb-6">
                    {analysisResult?.error || "Unknown error"}
                  </p>
                  <Button asChild>
                    <Link href="/upload">Try Again</Link>
                  </Button>
                </div>
              )}
              
              <div className="p-6 rounded-lg border border-border bg-card">
                <h2 className="text-xl font-semibold mb-4">Important Note</h2>
                <p className="text-muted-foreground">
                  This analysis is for educational purposes only and is not intended to replace 
                  professional medical advice. Always consult with your healthcare provider 
                  regarding your lab results and before making any changes to your health regimen.
                </p>
              </div>
            </div>
          )}
        </div>
      </Layout>
    </ProtectedRoute>
  );
}

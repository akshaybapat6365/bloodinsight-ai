"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { getGeminiService } from "@/lib/gemini-service";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AnalysisResult {
  success: boolean;
  analysis?: string;
  error?: string;
}

export default function AnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        // In a real implementation, we would get the uploaded file content from storage
        // For now, we'll use a sample lab report for demonstration
        const sampleLabReport = `
          COMPREHENSIVE METABOLIC PANEL
          
          Patient: John Doe
          Date: 2025-04-01
          
          TEST               RESULT    REFERENCE RANGE    FLAG
          -----------------------------------------------------
          Glucose            92 mg/dL   70-99 mg/dL        
          BUN                15 mg/dL   7-20 mg/dL         
          Creatinine         0.9 mg/dL  0.6-1.2 mg/dL      
          eGFR               >90        >60 mL/min/1.73m²  
          Sodium             140 mEq/L  136-145 mEq/L      
          Potassium          4.2 mEq/L  3.5-5.1 mEq/L      
          Chloride           102 mEq/L  98-107 mEq/L       
          Carbon Dioxide     24 mEq/L   21-32 mEq/L        
          Calcium            9.5 mg/dL  8.5-10.2 mg/dL     
          Total Protein      7.0 g/dL   6.4-8.2 g/dL       
          Albumin            4.5 g/dL   3.4-5.0 g/dL       
          Globulin           2.5 g/dL   2.0-3.5 g/dL       
          A/G Ratio          1.8        1.2-2.2            
          Bilirubin, Total   0.7 mg/dL  0.1-1.2 mg/dL      
          Alkaline Phosphatase 70 U/L   46-116 U/L         
          AST                22 U/L     15-37 U/L          
          ALT                25 U/L     16-61 U/L          
          
          LIPID PANEL
          
          TEST               RESULT    REFERENCE RANGE    FLAG
          -----------------------------------------------------
          Total Cholesterol  210 mg/dL  <200 mg/dL        HIGH
          Triglycerides      120 mg/dL  <150 mg/dL        
          HDL Cholesterol    45 mg/dL   >40 mg/dL         
          LDL Cholesterol    141 mg/dL  <100 mg/dL        HIGH
          
          ADDITIONAL TESTS
          
          TEST               RESULT    REFERENCE RANGE    FLAG
          -----------------------------------------------------
          Vitamin D, 25-OH   24 ng/mL   30-50 ng/mL       LOW
          TSH                2.5 mIU/L  0.5-4.5 mIU/L     
        `;

        const geminiService = getGeminiService();
        const result = await geminiService.analyzeLabReport(sampleLabReport);
        
        setAnalysisResult(result);
        setIsAnalyzing(false);
      } catch (error) {
        setAnalysisResult({
          success: false,
          error: error instanceof Error ? error.message : "An unknown error occurred",
        });
        setIsAnalyzing(false);
      }
    };

    // Simulate a delay before starting analysis
    const timer = setTimeout(() => {
      performAnalysis();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                BloodInsight AI
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container py-8">
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
                    {analysisResult.analysis?.split('\n').map((line, index) => (
                      <p key={index}>{line}</p>
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
        </main>

        <footer className="border-t border-border py-6 bg-background">
          <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 BloodInsight AI. For educational purposes only.
            </p>
            <p className="text-sm text-muted-foreground">
              Not intended to replace medical advice.
            </p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

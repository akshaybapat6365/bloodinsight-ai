"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Layout from "@/components/layout";

export default function Home() {
  return (
    <Layout
      headerRight={
        <Button variant="ghost" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      }
    >
        <section className="py-20">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-primary">BloodInsight AI</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-muted-foreground">
              Understand your bloodwork and lab reports with AI-powered health analytics
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-20 bg-secondary/20">
          <div className="container">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Easy to Understand</h3>
                <p className="text-muted-foreground">Get simple explanations of your lab results in plain language anyone can understand.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M2 12h20"></path>
                    <path d="M6 7l4 5-4 5"></path>
                    <path d="M18 7l-4 5 4 5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Track Trends</h3>
                <p className="text-muted-foreground">Upload multiple reports over time to see how your health metrics are changing.</p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path>
                    <path d="M12 12H3"></path>
                    <path d="M16 6v4"></path>
                    <path d="M8 6v4"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <path d="M22 22-1.5-1.5"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Multiple Formats</h3>
                <p className="text-muted-foreground">Upload PDFs, images, or Excel files of your lab reports for instant analysis.</p>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to understand your health data?</h2>
            <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
              BloodInsight AI helps you make sense of your lab results with AI-powered analysis and easy-to-understand explanations.
            </p>
            <Button size="lg" asChild>
              <Link href="/login">Get Started Now</Link>
            </Button>
          </div>
        </section>
    </Layout>
  );
}

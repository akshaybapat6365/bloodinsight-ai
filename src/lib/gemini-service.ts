"use client";

import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Generative AI with API key
// In production, this would be stored in environment variables
let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "DEMO_API_KEY";
let systemPrompt = `You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports. 
Your task is to:
1. Extract key metrics and values from the provided lab report
2. Identify which values are within normal range and which are outside normal range
3. Provide a clear, simple explanation of what each metric means and its significance
4. Offer general insights about the overall health picture based on these results
5. Suggest potential lifestyle modifications or follow-up actions when appropriate

Important notes:
- Always clarify that your analysis is for educational purposes only and not a substitute for medical advice
- Use plain, accessible language that a non-medical person can understand
- When values are outside normal range, explain the potential implications without causing alarm
- Organize information in a structured, easy-to-read format
- Focus on factual information and avoid speculative diagnoses`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-pro-exp-03-25",
    });
  }

  // Method to update API key (for admin use)
  public updateApiKey(newKey: string) {
    apiKey = newKey;
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-pro-exp-03-25",
    });
    return true;
  }

  // Method to update system prompt (for admin use)
  public updateSystemPrompt(newPrompt: string) {
    systemPrompt = newPrompt;
    return true;
  }

  // Method to get current system prompt
  public getSystemPrompt() {
    return systemPrompt;
  }

  // Method to analyze text content from a lab report
  public async analyzeLabReport(content: string) {
    try {
      const prompt = `${systemPrompt}\n\nHere is the lab report to analyze:\n${content}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        analysis: text,
      };
    } catch (error) {
      console.error("Error analyzing lab report:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  // Method to analyze an image of a lab report
  public async analyzeLabReportImage(imageData: string) {
    try {
      const prompt = `${systemPrompt}\n\nAnalyze the lab report in this image:`;
      
      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: imageData,
            mimeType: "image/jpeg", // Adjust based on actual image type
          },
        },
      ]);
      
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        analysis: text,
      };
    } catch (error) {
      console.error("Error analyzing lab report image:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}

// Create a singleton instance
let geminiServiceInstance: GeminiService | null = null;

export const getGeminiService = () => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
  }
  return geminiServiceInstance;
};

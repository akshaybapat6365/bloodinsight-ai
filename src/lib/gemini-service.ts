
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

// Default system prompt used if none is stored in the database
const DEFAULT_PROMPT = `You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports.
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
  private genAI: GoogleGenerativeAI | null = null; // Initialize as null
  private model: any; // Consider using a more specific type if available from SDK
  private currentApiKey: string | null = null;

  private systemPrompt = DEFAULT_PROMPT;

  constructor() {}

  // Load configuration from the database (API key and system prompt)
  public async init() {
    const config = await prisma.geminiConfig.findFirst();
    const key = config?.apiKey ?? process.env.GEMINI_API_KEY ?? null;

    const promptRecord = await prisma.systemPrompt.findFirst({ where: { isDefault: true } });
    if (promptRecord?.content) {
      this.systemPrompt = promptRecord.content;
    }

    if (key) {
      this.currentApiKey = key;
      this.genAI = new GoogleGenerativeAI(key);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
      });
    } else {
      console.error("GeminiService initialized without API key.");
      this.model = null;
    }
  }

  // Method to update API key (for admin use)
  public async updateApiKey(newKey: string) {
    if (!newKey || newKey.trim() === "") {
      throw new Error("API key cannot be empty");
    }

    try {
      const existing = await prisma.geminiConfig.findFirst();
      if (existing) {
        await prisma.geminiConfig.update({ where: { id: existing.id }, data: { apiKey: newKey } });
      } else {
        await prisma.geminiConfig.create({ data: { apiKey: newKey } });
      }

      this.currentApiKey = newKey;
      this.genAI = new GoogleGenerativeAI(newKey);
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.5-pro-exp-03-25",
      });

      console.log("Gemini API key updated successfully");
      return true;
    } catch (error) {
      console.error("Failed to update Gemini API key:", error);
      throw new Error(
        "Failed to update API key: " + (error instanceof Error ? error.message : "Unknown error")
      );
    }
  }

  // Method to update system prompt (for admin use)
  public async updateSystemPrompt(newPrompt: string) {
    const existing = await prisma.systemPrompt.findFirst({ where: { isDefault: true } });
    if (existing) {
      await prisma.systemPrompt.update({ where: { id: existing.id }, data: { content: newPrompt } });
    } else {
      await prisma.systemPrompt.create({ data: { name: "Default", content: newPrompt, isDefault: true } });
    }
    this.systemPrompt = newPrompt;
    return true;
  }

  // Method to get current system prompt
  public getSystemPrompt() {
    return this.systemPrompt;
  }

  // Method to analyze text content from a lab report
  public async analyzeLabReport(content: string) {
    if (!this.model || !this.genAI) {
      return { success: false, error: "Gemini service not initialized (API key missing?)." };
    }
    try {
      const prompt = `${this.systemPrompt}\n\nHere is the lab report to analyze:\n${content}`;
      
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
    if (!this.model || !this.genAI) {
      return { success: false, error: "Gemini service not initialized (API key missing?)." };
    }
    try {
      const prompt = `${this.systemPrompt}\n\nAnalyze the lab report in this image:`;
      
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

export const getGeminiService = async () => {
  if (!geminiServiceInstance) {
    geminiServiceInstance = new GeminiService();
    await geminiServiceInstance.init();
  }
  return geminiServiceInstance;
};

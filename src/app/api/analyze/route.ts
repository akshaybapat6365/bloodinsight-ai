import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import mime from 'mime-types';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Save file temporarily
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempFilePath = path.join('/tmp', `${uuidv4()}-${file.name}`);
    await writeFile(tempFilePath, buffer);
    
    // Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Get file content as base64
    const fileContent = fs.readFileSync(tempFilePath);
    const base64Content = fileContent.toString('base64');
    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    
    // Get model with system instruction
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro-preview-03-25",
      systemInstruction: `You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports. 
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
- Focus on factual information and avoid speculative diagnoses`,
    });
    
    // Configure generation parameters
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
    };
    
    // Start chat session and get response
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });
    
    const result = await chatSession.sendMessage([
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Content
        }
      }
    ]);
    
    // Clean up temp file
    fs.unlinkSync(tempFilePath);
    
    return NextResponse.json({ 
      analysis: result.response.text(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: 'Failed to process file' }, { status: 500 });
  }
}

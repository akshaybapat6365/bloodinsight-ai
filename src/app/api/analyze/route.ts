import { GoogleGenerativeAI } from "@google/generative-ai"; 
import type { Part } from "@google/generative-ai"; 
import { NextResponse } from 'next/server';
// NOTE: We don't need googleapis or the upload-temp helpers here anymore

// Get API Key from server-side environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the client using @google/generative-ai
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-03-25" }) : null; 

if (!genAI || !model) {
  console.error("Failed to initialize @google/generative-ai client (API key missing or invalid?).");
}

// Define the system prompt 
const systemPrompt = `You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports. 
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


export async function POST(request: Request) {
  // Ensure the service is initialized
  if (!model) {
    console.error("Gemini model not initialized. API key might be missing.");
    return NextResponse.json({ success: false, error: "Analysis service is not configured correctly." }, { status: 500 });
  }

  let fileId: string | undefined; // Declare fileId outside the try block

  try {
    const body = await request.json();
    fileId = body.fileId; // Assign inside the try block

    if (!fileId || typeof fileId !== 'string' || !fileId.startsWith('files/')) {
        return NextResponse.json({ success: false, error: "Missing or invalid Google file resource name ('fileId') in request body." }, { status: 400 });
    }

    // Prepare parts for Gemini API using the file resource name
    const requestParts: Part[] = [
        { text: `${systemPrompt}\n\nAnalyze the lab report contained in the uploaded file referenced below:` },
        {
            // Reference the uploaded file using fileData part
            fileData: {
                // Let Gemini infer mimeType from the file stored via Files API
                mimeType: "application/octet-stream", // Or try omitting mimeType entirely if API allows
                fileUri: fileId // Use the Google file resource name directly
            }
        }
    ];

    // Call Gemini API
    console.log(`Sending analysis request for file resource: ${fileId}`);
    const result = await model.generateContent({ contents: [{ role: "user", parts: requestParts }] }); 
    const response = await result.response;
    const analysisText = response.text();

    // NOTE: We don't delete the file from Google here. 
    // Google's Files API has its own lifecycle management, or deletion could be added later if needed.

    // Return successful analysis
    return NextResponse.json({ success: true, analysis: analysisText });

  } catch (error) {
    console.error("Error in /api/analyze:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred during analysis.";
    // Check for specific API key error from Google
    if (errorMessage.includes("API key not valid")) {
       return NextResponse.json({ success: false, error: "Invalid API Key configured for Gemini service." }, { status: 500 });
    }
     // Check for errors related to accessing the file URI
    if (errorMessage.includes("Unable to find file") || errorMessage.includes("PERMISSION_DENIED")) {
         return NextResponse.json({ success: false, error: `Error accessing uploaded file (${fileId}). It might have expired or permissions are incorrect.` }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

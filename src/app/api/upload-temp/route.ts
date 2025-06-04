import { NextResponse } from 'next/server';
import { GoogleAIFileManager } from "@google/generative-ai/server"; 
import fs from 'node:fs/promises'; // Use promises API for async operations
import os from 'node:os';       // To get temporary directory
import path from 'node:path';   // For joining paths
import { randomUUID } from 'node:crypto'; // For unique filenames

// Maximum file size allowed (bytes). Default to 5MB if not provided
const MAX_UPLOAD_BYTES = parseInt(process.env.MAX_UPLOAD_BYTES || '5242880', 10);

// Allowed MIME types for uploads
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

// Get API Key from server-side environment variables
const apiKey = process.env.GEMINI_API_KEY;

// Initialize the File Manager (only if API key exists)
const fileManager = apiKey ? new GoogleAIFileManager(apiKey) : null;

if (!fileManager) {
  console.error("Failed to initialize GoogleAIFileManager (API key missing or invalid?).");
}

export async function POST(request: Request) {
  // Check if the file manager was initialized successfully
  if (!fileManager) {
     return NextResponse.json({ success: false, error: "File upload service not initialized (API key missing)." }, { status: 500 });
  }

  let tempFilePath: string | undefined; // To store the path for cleanup

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      const maxMb = Math.round(MAX_UPLOAD_BYTES / (1024 * 1024));
      return NextResponse.json({ success: false, error: `File exceeds maximum size of ${maxMb}MB.` }, { status: 413 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Unsupported file type.' }, { status: 400 });
    }

    // 1. Save file temporarily
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const tempDir = os.tmpdir(); // Get system temp directory
    // Create a unique temporary filename
    const uniqueFilename = `${randomUUID()}-${file.name}`; 
    tempFilePath = path.join(tempDir, uniqueFilename); 

    console.log(`Saving temporary file to: ${tempFilePath}`);
    await fs.writeFile(tempFilePath, fileBuffer);
    console.log(`Temporary file saved: ${file.name} (${file.type})`);

    // 2. Upload the file from the temporary path using the GoogleAIFileManager
    console.log(`Uploading temporary file via GoogleAIFileManager: ${tempFilePath}`);
    const uploadResult = await fileManager.uploadFile(tempFilePath, { // Pass the path
        mimeType: file.type,
        displayName: file.name 
    }); 

    const uploadedFile = uploadResult.file; 

    if (!uploadedFile || !uploadedFile.name) {
        console.error("Raw upload result:", uploadResult); 
        throw new Error('File upload via GoogleAIFileManager failed or did not return expected file resource name.');
    }

    console.log(`File uploaded successfully via GoogleAIFileManager. Resource name: ${uploadedFile.name}`);

    // Return the Google-generated file resource name
    return NextResponse.json({ success: true, fileId: uploadedFile.name });

  } catch (error) {
    console.error("Error during temporary file save or upload via GoogleAIFileManager:", error);
    let errorMessage = "Unknown error occurred during file upload.";
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    if (errorMessage.includes("API key not valid")) {
       return NextResponse.json({ success: false, error: "Invalid API Key configured for Gemini service." }, { status: 500 });
    }
    if (errorMessage.includes("permission") || errorMessage.includes("PermissionDenied")) {
         return NextResponse.json({ success: false, error: "API key lacks permission for file uploads. Please check Google Cloud IAM settings." }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  } finally {
      // 3. Clean up: Delete the temporary file if it was created
      if (tempFilePath) {
          try {
              await fs.unlink(tempFilePath);
              console.log(`Deleted temporary file: ${tempFilePath}`);
          } catch (cleanupError) {
              console.error(`Error deleting temporary file ${tempFilePath}:`, cleanupError);
              // Log error but don't necessarily fail the request if upload succeeded
          }
      }
  }
}

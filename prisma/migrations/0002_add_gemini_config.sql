-- Add GeminiConfig table for storing Gemini API key
CREATE TABLE "GeminiConfig" (
    "id" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GeminiConfig_pkey" PRIMARY KEY ("id")
);

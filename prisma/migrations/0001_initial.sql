-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthMetric" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "minValue" DOUBLE PRECISION,
    "maxValue" DOUBLE PRECISION,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricReading" (
    "id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "reportId" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,

    CONSTRAINT "MetricReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemPrompt" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemPrompt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricReading" ADD CONSTRAINT "MetricReading_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricReading" ADD CONSTRAINT "MetricReading_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "HealthMetric"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default health metrics
INSERT INTO "HealthMetric" ("id", "name", "unit", "minValue", "maxValue", "description", "category", "createdAt", "updatedAt")
VALUES
  ('glucose', 'Glucose (Fasting)', 'mg/dL', 70, 99, 'Measures the amount of glucose in your blood after fasting for at least 8 hours.', 'Blood Sugar', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('total_cholesterol', 'Total Cholesterol', 'mg/dL', NULL, 200, 'Measures all cholesterol in your blood, including HDL, LDL, and triglycerides.', 'Lipids', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('hdl', 'HDL Cholesterol', 'mg/dL', 40, NULL, 'High-density lipoprotein, often called ''good'' cholesterol.', 'Lipids', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ldl', 'LDL Cholesterol', 'mg/dL', NULL, 100, 'Low-density lipoprotein, often called ''bad'' cholesterol.', 'Lipids', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('triglycerides', 'Triglycerides', 'mg/dL', NULL, 150, 'A type of fat found in your blood that your body uses for energy.', 'Lipids', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('vitamin_d', 'Vitamin D, 25-OH', 'ng/mL', 30, 50, 'Measures the amount of vitamin D in your blood, important for bone health.', 'Vitamins', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('tsh', 'TSH', 'mIU/L', 0.5, 4.5, 'Thyroid-stimulating hormone, which regulates thyroid function.', 'Hormones', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('creatinine', 'Creatinine', 'mg/dL', 0.6, 1.2, 'Waste product filtered by your kidneys, used to measure kidney function.', 'Kidney Function', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('alt', 'ALT', 'U/L', 16, 61, 'Enzyme found primarily in the liver, used to detect liver damage.', 'Liver Function', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ast', 'AST', 'U/L', 15, 37, 'Enzyme found in the liver and other tissues, used to detect liver damage.', 'Liver Function', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert default system prompt
INSERT INTO "SystemPrompt" ("id", "name", "content", "isDefault", "createdAt", "updatedAt")
VALUES
  ('default_prompt', 'Default Analysis Prompt', 'You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports. Your task is to: 1. Extract key metrics and values from the provided lab report 2. Identify which values are within normal range and which are outside normal range 3. Provide a clear, simple explanation of what each metric means and its significance 4. Offer general insights about the overall health picture based on these results 5. Suggest potential lifestyle modifications or follow-up actions when appropriate Important notes: - Always clarify that your analysis is for educational purposes only and not a substitute for medical advice - Use plain, accessible language that a non-medical person can understand - When values are outside normal range, explain the potential implications without causing alarm - Organize information in a structured, easy-to-read format - Focus on factual information and avoid speculative diagnoses', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

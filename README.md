# BloodInsight AI

BloodInsight AI is an AI-powered health analytics web application that helps people understand their bloodwork and lab reports. The application uses Google's Gemini API to analyze uploaded medical documents and provide easy-to-understand explanations.

## Current Status (As of 2025-04-05)

- **Core Functionality:** Authentication (Google Sign-In via NextAuth v4) and basic page structure are in place. Environment variables for Google OAuth and Gemini API are configured in `.env.local`. Initial CSS issues have been resolved.
- **File Handling:** The current implementation uses the Google Gemini Files API.
    1. Files are uploaded from the client (`/upload`) to a server route (`/api/upload-temp`).
    2. The server route saves the file temporarily to the OS temp directory (`os.tmpdir()`).
    3. The temporary file path is used to upload the file to Google via `GoogleAIFileManager.uploadFile`.
    4. The temporary file is deleted from the server.
    5. The Google file resource name (`fileId`) is returned to the client.
    6. The client navigates to `/analysis?fileId=<fileId>`.
    7. The analysis page reads the `fileId` and sends it to `/api/analyze`.
    8. The analyze route uses the `fileId` to reference the uploaded file in its prompt to the Gemini model (`fileData` part).
- **Known Issues:** The upload/analysis flow is currently **failing**. The exact point of failure after the latest changes (implementing the Files API correctly) needs further debugging. The UI/UX also requires significant improvement.

## Features

- **Google Sign-In Authentication**: Secure authentication using Google accounts
- **Document Upload**: Support for PDF, images (JPEG, PNG, TIFF), and Excel files
- **AI-Powered Analysis**: Uses Google's Gemini API to analyze lab reports
- **Trends Analysis**: Track health metrics over time with interactive visualizations
- **Export Functionality**: Export results in PDF and CSV formats
- **Admin Console**: Manage system prompts, monitor usage, and update API keys
- **AdminRoute**: Client-side component that redirects non-admin users based on
  the `isAdmin` flag in their session
- **Mobile Responsive**: Optimized for all device sizes
- **Dark Theme**: Modern, professional dark theme using ShadcnUI components

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, ShadcnUI
- **Authentication**: NextAuth.js with Google provider
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: Google Gemini API (gemini-2.5-pro-exp-03-25 model)
- **Visualization**: Recharts for data visualization
- **Export**: jsPDF and custom CSV export functionality
- **Deployment**: Vercel with PostgreSQL

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google Cloud account for Gemini API and OAuth

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   DATABASE_URL=your_postgres_connection_string
   ```
   **Important:** keep `GEMINI_API_KEY` on the server only; it should never be exposed to the client.
4. Initialize the database:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. (Optional) Lint and build the project. Make sure you have run `npm install` before executing these commands:
   ```bash
   npm run lint
   npm run build
   ```
7. The `/api/upload-temp` route validates uploaded files. The server accepts only the following MIME types:
   - `application/pdf`
   - `image/jpeg`
   - `image/png`
   - `image/tiff`
   - `application/vnd.ms-excel`
   - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
   Any other MIME type will cause the endpoint to return a `400` error.

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

- `/src/app`: Next.js pages and routes
- `/src/components`: Reusable React components
- `/src/lib`: Utility functions and services
- `/prisma`: Database schema and migrations
- `/public`: Static assets

## Key Components

- **Authentication**: Google Sign-In with protected routes
- **Document Upload**: File validation and storage
- **Gemini API Integration**: AI-powered analysis of lab reports
- **Admin Console**: System management and monitoring
- **Trends Analysis**: Interactive visualizations of health metrics over time
- **Export Functionality**: PDF and CSV export options

## Admin API

The `/api/admin/gemini` endpoint allows administrators to manage Gemini-related
settings. The route is protected by NextAuth and only users with `isAdmin = true`
can access it. The `isAdmin` flag is included in the user's session token and is
checked by both API routes and the `AdminRoute` component. Unauthorized requests
return `401` or `403`.

- **GET** `/api/admin/gemini`
  - Returns the current system prompt:
    ```json
    { "systemPrompt": "..." }
    ```
- **POST** `/api/admin/gemini`
  - Accepts a JSON payload with `action` and `value` fields. The values are persisted in the database.
    - `{"action": "updateApiKey", "value": "NEW_KEY"}` stores a new Gemini API key.
    - `{"action": "updateSystemPrompt", "value": "PROMPT_TEXT"}` updates the default system prompt.

## Educational Purpose

This application is for educational purposes only and is not intended to replace medical advice. Always consult with healthcare providers regarding lab results and health decisions.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

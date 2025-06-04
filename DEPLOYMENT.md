# BloodInsight AI Deployment Guide

This document provides instructions for deploying the BloodInsight AI application on Vercel with a PostgreSQL database.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account (https://vercel.com)
2. A PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)
3. A Google Cloud account with the Gemini API enabled
4. Google OAuth credentials for authentication

## Environment Variables

The following environment variables need to be configured in your Vercel project:

```
GEMINI_API_KEY=your_gemini_api_key
NEXTAUTH_URL=your_deployment_url (e.g., https://bloodinsight-ai.vercel.app)
NEXTAUTH_SECRET=your_nextauth_secret (generate with `openssl rand -base64 32`)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
DATABASE_URL=your_postgres_connection_string
```
`GEMINI_API_KEY` must remain server-side; never expose it to the browser.

## Deployment Steps

### 1. Database Setup

1. Create a PostgreSQL database in your preferred provider
2. Get the connection string in the format: `postgresql://username:password@hostname:port/database`
3. Set this as the `DATABASE_URL` environment variable in Vercel

### 2. Database Migration

After deploying, you'll need to run the initial migration to set up the database schema. The build script (`npm run build`) now automatically executes `prisma generate` and `prisma migrate deploy`, so the migration normally runs during deployment:

```bash
# Install Prisma CLI
npm install -g prisma

# Set DATABASE_URL environment variable
export DATABASE_URL=your_postgres_connection_string

# Run the migration
prisma migrate deploy
```

If needed, you can still run the migration manually using the Vercel CLI:

```bash
vercel env pull
npx prisma migrate deploy
```

### 3. Google OAuth Setup

1. Go to the Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or use an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Set the authorized redirect URI to `https://your-domain.vercel.app/api/auth/callback/google`
6. Copy the Client ID and Client Secret to the environment variables

### 4. Gemini API Setup

1. Go to the Google AI Studio (https://makersuite.google.com/)
2. Get an API key for the Gemini API
3. Set this as the `GEMINI_API_KEY` environment variable (server-side only)

### 5. Vercel Deployment

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import the project in Vercel
3. Install dependencies locally before running the build:
   ```bash
   npm install
   ```
   This step must be completed prior to executing `npm run build`, which also runs `prisma generate` and `prisma migrate deploy`.
4. Configure the environment variables
5. Deploy the application

## Post-Deployment

After deployment, you should:

1. Set up an admin user by directly modifying the database:
   ```sql
   UPDATE "User" SET "isAdmin" = true WHERE "email" = 'admin@bloodinsight.ai';
   ```

2. Access the admin console at `https://your-domain.vercel.app/admin`

3. Update the Gemini API key and system prompt in the admin console. These
   updates are sent to the protected `/api/admin/gemini` endpoint using a JSON
   payload with an `action` (`updateApiKey` or `updateSystemPrompt`) and `value`.

## Monitoring and Maintenance

- Monitor API usage in the admin console
- Regularly back up your database
- Check for any rate limiting issues
- Update the system prompt as needed to improve analysis results

## Troubleshooting

If you encounter issues:

1. Check the Vercel deployment logs
2. Verify all environment variables are correctly set
3. Ensure the database migration ran successfully
4. Check that the Google OAuth credentials are correctly configured
5. Verify the Gemini API key is valid and has sufficient quota

## Security Considerations

- Regularly rotate the Gemini API key
- Monitor for unusual usage patterns
- Ensure all sensitive data is properly encrypted
- Regularly update dependencies to patch security vulnerabilities

## Support

For any issues or questions, please contact the development team.

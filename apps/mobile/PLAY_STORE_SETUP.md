# Google Play Console & Service Account Setup

## Step 1: Google Play Console Setup

1. **Create Google Play Developer Account**
   - Go to [Google Play Console](https://play.google.com/console)
   - Pay the one-time $25 registration fee
   - Complete account verification

2. **Create Your App**
   - Click "Create app"
   - App name: "Bitsacco"
   - Default language: English (US)
   - App or game: App
   - Free or paid: Free (or Paid if applicable)
   - Content rating: Complete questionnaire
   - Target audience: Select appropriate age groups

3. **Set Up App Details**
   - Package name: `com.bitsacco.app` (matches app.json)
   - App category: Finance (or appropriate category)
   - Store listing details:
     - Short description (80 characters)
     - Full description (4000 characters)
     - Screenshots (phone, tablet, feature graphic)
     - App icon (512x512 px)

## Step 2: Google Cloud Service Account Setup

1. **Access Google Cloud Console**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Select or create a project (can be same as your app)

2. **Enable Google Play Developer API**
   - Go to APIs & Services > Library
   - Search for "Google Play Developer API"
   - Click and enable it

3. **Create Service Account**
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Name: "play-store-deployment"
   - Description: "Service account for automated Play Store deployments"
   - Click "Create and Continue"

4. **Generate Service Account Key**
   - In the service account list, click on the newly created account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Download and save the JSON file securely

## Step 3: Link Service Account to Play Console

1. **Get Service Account Email**
   - From the downloaded JSON file, copy the "client_email" value
   - It looks like: `play-store-deployment@your-project.iam.gserviceaccount.com`

2. **Add to Play Console**
   - Go back to Google Play Console
   - Go to Setup > API access
   - Click "Link Google Cloud Project" if not linked
   - In "Service accounts" section, click "Grant access"
   - Paste the service account email
   - Set permissions:
     - ✅ View app information and download bulk reports
     - ✅ Manage store presence
     - ✅ Manage app releases
     - ✅ Manage testing tracks and edit tester lists
   - Click "Apply"

## Step 4: GitHub Secrets Configuration

Add these secrets to your GitHub repository settings:

1. **EXPO_TOKEN**
   - Go to [Expo Access Tokens](https://expo.dev/settings/access-tokens)
   - Create new token with appropriate permissions
   - Copy the token value

2. **GOOGLE_PLAY_SERVICE_ACCOUNT_JSON**
   - Open the downloaded service account JSON file
   - Copy the entire content
   - Paste as secret value (it should start with `{` and end with `}`)

## Step 5: Test Local Setup

Run these commands from the `apps/mobile` directory:

```bash
# Login to Expo (if not already logged in)
npx eas login

# Build preview APK
npx eas build --platform android --profile preview

# Build production AAB
npx eas build --platform android --profile production

# Test submission (dry run)
npx eas submit --platform android --profile production
```

## Troubleshooting

### Common Issues:

1. **"Package name already exists"**
   - Change the package name in `app.json`
   - Must be unique across Google Play Store

2. **"Invalid service account"**
   - Ensure service account has correct permissions
   - Check that it's linked to the right Google Cloud project

3. **"API not enabled"**
   - Ensure Google Play Developer API is enabled
   - Check that billing is set up in Google Cloud

4. **"Track not found"**
   - You need to create at least one release manually first
   - Go to Play Console > Testing > Internal testing
   - Create a release manually to initialize the track

## Manual First Release (Required)

Before automation works, you need to create your first release manually:

1. Go to Play Console > Testing > Internal testing
2. Click "Create new release"
3. Upload the AAB file from your first `eas build`
4. Add release notes
5. Review and rollout to internal testing

After this, automated submissions will work.

## Security Notes

- Store the service account JSON securely
- Never commit the JSON file to your repository
- Use GitHub encrypted secrets for sensitive data
- Regularly rotate access tokens
- Monitor API usage in Google Cloud Console
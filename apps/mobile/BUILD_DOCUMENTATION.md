# Bitsacco Mobile - EAS Build Documentation

## Overview
This document outlines the build process for the Bitsacco mobile application using Expo Application Services (EAS) Build. The project is configured for internal distribution to team members.

## Prerequisites

### 1. Expo CLI and EAS CLI Installation
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI globally
npm install -g eas-cli
```

### 2. Expo Account Setup
- Create an Expo account at https://expo.dev
- Login to your account: `eas login`
- Verify login: `eas whoami`

### 3. Project Setup
Ensure you're in the mobile app directory:
```bash
cd apps/mobile
```

## Build Profiles

### Development Build
- **Purpose**: For development and testing with Expo Development Client
- **Distribution**: Internal team sharing
- **Output**: APK file
- **Command**: `eas build --profile development --platform android`

### Preview Build
- **Purpose**: Production-like build for internal testing
- **Distribution**: Internal team sharing
- **Output**: APK file
- **Command**: `eas build --profile preview --platform android`

### Production Build
- **Purpose**: Final release build
- **Distribution**: Google Play Store
- **Output**: AAB (Android App Bundle)
- **Command**: `eas build --profile production --platform android`

## Build Process

### Step 1: Prepare for Build
```bash
# Navigate to mobile app directory
cd apps/mobile

# Ensure dependencies are up to date
npm install

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Test the app locally first
npx expo start
```

### Step 2: Configure EAS Project
```bash
# Initialize EAS project (one-time setup)
eas build:configure
```

### Step 3: Run Build
For internal distribution (recommended for team sharing):
```bash
# Preview build for internal testing
eas build --profile preview --platform android
```

For development builds:
```bash
# Development build with Expo Development Client
eas build --profile development --platform android
```

### Step 4: Monitor Build Progress
- Build status can be monitored at: https://expo.dev/accounts/[your-username]/projects/bitsacco/builds
- You'll receive email notifications when builds complete
- Build logs are available in the Expo dashboard

### Step 5: Download and Distribute
1. Once build completes, download the APK from the Expo dashboard
2. Share the APK with team members via:
   - Direct download link (provided by Expo)
   - File sharing services
   - Internal distribution platforms

## Installation on Android Devices

### For Team Members:
1. Enable "Unknown Sources" or "Install from Unknown Sources" in Android settings
2. Download the APK file
3. Open the APK file to install
4. Grant necessary permissions during installation

### Development Client Installation:
If using development builds, team members need to install Expo Go or the custom development client:
```bash
# Install on device connected via USB
adb install path/to/your-app.apk
```

## Troubleshooting

### Common Build Issues:

#### 1. Node.js Version Conflicts
- Ensure Node.js version is compatible with Expo SDK 54
- Use Node.js 18.x or 20.x

#### 2. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### 3. Metro Bundle Issues
```bash
# Clear Metro cache
npx expo start --clear
```

#### 4. Build Failures
- Check build logs in Expo dashboard
- Ensure all required assets are present in `assets/` directory
- Verify app.json configuration is correct

### Asset Requirements:
Ensure these files exist in the `assets/` directory:
- `icon.png` (1024x1024)
- `adaptive-icon.png` (1024x1024)
- `splash-icon.png` (1284x2778 for iOS, 1080x1920 for Android)
- `favicon.png` (48x48)

## Monorepo Considerations

This project is part of a monorepo structure. Key considerations:

1. **Metro Configuration**: Already configured to work with workspace packages
2. **Build Context**: EAS builds run from the mobile app directory
3. **Shared Dependencies**: Dependencies from the root workspace are handled automatically
4. **Path Resolution**: All paths in app.json are relative to the mobile app directory

## Environment Variables

For production builds, environment variables can be configured in eas.json:
```json
{
  "build": {
    "preview": {
      "env": {
        "NODE_ENV": "production",
        "API_URL": "https://api.bitsacco.com"
      }
    }
  }
}
```

## Build Automation

For CI/CD integration, builds can be triggered programmatically:
```bash
# Trigger build via CLI
eas build --profile preview --platform android --non-interactive

# With custom message
eas build --profile preview --platform android --message "Internal testing build v1.0.1"
```

## Team Access Management

To give team members access to builds:
1. Invite team members to the Expo organization
2. Grant appropriate permissions in Expo dashboard
3. Team members can access builds at: https://expo.dev

## Support

- **Expo Documentation**: https://docs.expo.dev/build/introduction/
- **EAS Build Documentation**: https://docs.expo.dev/build/setup/
- **React Native Documentation**: https://reactnative.dev/docs/getting-started

## Quick Reference Commands

```bash
# Login to EAS
eas login

# Check build status
eas build:list

# View specific build details
eas build:view [BUILD_ID]

# Download build artifact
eas build:download [BUILD_ID]

# Run local development
npx expo start

# Type check
npm run typecheck

# Lint code
npm run lint
```
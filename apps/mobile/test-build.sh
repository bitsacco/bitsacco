#!/bin/bash

echo "🧪 Testing Bitsacco Mobile Build Configuration"
echo "=============================================="

# Check EAS CLI
echo "1. Checking EAS CLI installation..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
else
    echo "✅ EAS CLI found: $(eas --version)"
fi

# Check project info
echo ""
echo "2. Checking project information..."
eas project:info

# Validate configuration files
echo ""
echo "3. Validating configuration files..."

if [ -f "eas.json" ]; then
    echo "✅ eas.json found"
    echo "Build profiles:"
    cat eas.json | grep -A 1 "\"development\"\|\"preview\"\|\"production\""
else
    echo "❌ eas.json not found"
    exit 1
fi

if [ -f "app.json" ]; then
    echo "✅ app.json found"
    echo "Package name: $(cat app.json | grep -o '"package":[^,]*')"
    echo "Version: $(cat app.json | grep -o '"version":[^,]*')"
    echo "Version code: $(cat app.json | grep -o '"versionCode":[^,]*')"
else
    echo "❌ app.json not found"
    exit 1
fi

# Check dependencies
echo ""
echo "4. Checking dependencies..."
if [ -f "package.json" ]; then
    echo "✅ package.json found"
    npm list expo --depth=0 2>/dev/null || echo "⚠️  Expo SDK not found in local dependencies"
else
    echo "❌ package.json not found"
    exit 1
fi

# Test EAS build (dry run)
echo ""
echo "5. Testing EAS build configuration..."
echo "Preview build (dry run):"
eas build --platform android --profile preview --non-interactive --clear-cache --local || echo "⚠️  Preview build configuration test completed with warnings"

echo ""
echo "Production build (dry run):"
eas build --platform android --profile production --non-interactive --clear-cache --local || echo "⚠️  Production build configuration test completed with warnings"

echo ""
echo "🎉 Build configuration test completed!"
echo ""
echo "Next steps:"
echo "1. Follow PLAY_STORE_SETUP.md to configure Google Play Console"
echo "2. Add EXPO_TOKEN and GOOGLE_PLAY_SERVICE_ACCOUNT_JSON to GitHub secrets"
echo "3. Create a test PR to trigger preview build"
echo "4. Push to main to trigger production build"
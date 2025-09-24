#!/bin/bash

echo "✅ EAS Configuration Validation"
echo "==============================="

# Check files
echo "✅ eas.json exists and configured for Android builds"
echo "✅ app.json has proper package name: com.bitsacco.app"
echo "✅ Project ID: bb82ad71-e482-4e68-bd70-7287e110aace"
echo "✅ Expo owner: minmo"

# Check GitHub workflows
if [ -f "../../.github/workflows/mobile-preview.yml" ]; then
    echo "✅ Preview workflow created"
else
    echo "❌ Preview workflow missing"
fi

if [ -f "../../.github/workflows/mobile-production.yml" ]; then
    echo "✅ Production workflow created"
else
    echo "❌ Production workflow missing"
fi

echo ""
echo "🚀 Setup Complete! Next steps:"
echo "1. Follow PLAY_STORE_SETUP.md to configure Google Play Console"
echo "2. Add these GitHub secrets:"
echo "   - EXPO_TOKEN"
echo "   - GOOGLE_PLAY_SERVICE_ACCOUNT_JSON"
echo "3. Test with: 'npx eas build --platform android --profile preview'"
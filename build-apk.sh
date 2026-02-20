#!/bin/bash

# PixelPet APK Build Script
# This script builds the PixelPet Android APK

set -e

echo "=========================================="
echo "  PixelPet APK Build Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the app directory"
    exit 1
fi

# Step 1: Clean previous build
print_status "Step 1: Cleaning previous build..."
rm -rf dist
rm -rf android/app/src/main/assets/public
print_success "Clean complete"

# Step 2: Install dependencies (if needed)
print_status "Step 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing npm dependencies..."
    npm install
fi
print_success "Dependencies ready"

# Step 3: Build web app
print_status "Step 3: Building web application..."
npm run build
if [ ! -d "dist" ]; then
    print_error "Build failed - dist directory not created"
    exit 1
fi
print_success "Web build complete"

# Step 4: Sync with Capacitor
print_status "Step 4: Syncing with Capacitor..."
npx cap sync android
print_success "Capacitor sync complete"

# Step 5: Build APK
print_status "Step 5: Building Android APK..."
cd android

# Check if gradlew is executable
if [ ! -x "./gradlew" ]; then
    chmod +x ./gradlew
fi

# Build debug APK
./gradlew assembleDebug

# Check if build succeeded
if [ ! -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
    print_error "APK build failed"
    exit 1
fi

print_success "APK build complete!"

# Step 6: Copy APK to output directory
print_status "Step 6: Copying APK to output directory..."
cd ..
mkdir -p output
APK_NAME="PixelPet-v$(date +%Y%m%d-%H%M%S).apk"
cp android/app/build/outputs/apk/debug/app-debug.apk "output/$APK_NAME"

print_success "Build complete!"
echo ""
echo "=========================================="
echo "  APK Location:"
echo "  output/$APK_NAME"
echo "=========================================="
echo ""
echo "To install on your device:"
echo "  adb install output/$APK_NAME"
echo ""
echo "Or copy the APK to your device and install manually."
echo ""

# Optional: Build release APK if keystore exists
if [ -f "android/pixelpet.keystore" ]; then
    print_status "Release keystore found. Building release APK..."
    cd android
    ./gradlew assembleRelease
    
    if [ -f "app/build/outputs/apk/release/app-release-unsigned.apk" ]; then
        jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
            -keystore pixelpet.keystore \
            -storepass pixelpet \
            app/build/outputs/apk/release/app-release-unsigned.apk pixelpet
        
        zipalign -v 4 \
            app/build/outputs/apk/release/app-release-unsigned.apk \
            app/build/outputs/apk/release/app-release.apk
        
        cp app/build/outputs/apk/release/app-release.apk "../output/PixelPet-release-v$(date +%Y%m%d-%H%M%S).apk"
        print_success "Release APK built!"
    fi
    cd ..
fi

print_success "All done! Enjoy your PixelPet! 🐾"

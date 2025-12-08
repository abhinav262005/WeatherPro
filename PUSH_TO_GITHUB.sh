#!/bin/bash

echo "========================================"
echo "  WeatherPro - Push to GitHub"
echo "========================================"
echo ""

echo "Checking Git status..."
git status
echo ""

echo "========================================"
echo "Ready to push to GitHub!"
echo "Repository: https://github.com/abhinav262005/WeatherPro"
echo "========================================"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."

echo "Step 1: Adding all files..."
git add .
echo "Done!"
echo ""

echo "Step 2: Creating commit..."
git commit -m "Initial commit: WeatherPro v1.0.0 - Ultimate Weather Dashboard"
echo "Done!"
echo ""

echo "Step 3: Adding remote repository..."
git remote add origin https://github.com/abhinav262005/WeatherPro.git
echo "Done!"
echo ""

echo "Step 4: Pushing to GitHub..."
git branch -M main
git push -u origin main
echo ""

echo "========================================"
echo "  Upload Complete!"
echo "========================================"
echo ""
echo "Visit your repository at:"
echo "https://github.com/abhinav262005/WeatherPro"
echo ""

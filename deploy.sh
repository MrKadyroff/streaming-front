#!/bin/bash

# Deploy script for F4U frontend
echo "🚀 Starting deployment to server..."

# Build the project
echo "📦 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build successful!"

# Create deployment directory if it doesn't exist
echo "📁 Creating deployment directory..."
ssh ubuntu@185.4.180.54 "sudo mkdir -p /var/www/sportFront && sudo chown ubuntu:ubuntu /var/www/sportFront"

# Upload files
echo "📤 Uploading files to server..."
scp -r build/* ubuntu@185.4.180.54:/var/www/sportFront/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed!"
    exit 1
fi

echo "✅ Files uploaded successfully!"

# Update nginx configuration
echo "⚙️ Updating nginx configuration..."
scp nginx.conf ubuntu@185.4.180.54:/tmp/sportFront.conf
ssh ubuntu@185.4.180.54 "sudo mv /tmp/sportFront.conf /etc/nginx/sites-available/sportFront && sudo ln -sf /etc/nginx/sites-available/sportFront /etc/nginx/sites-enabled/ && sudo nginx -t && sudo systemctl reload nginx"

if [ $? -ne 0 ]; then
    echo "⚠️ Nginx configuration update failed, but files are uploaded"
    echo "Please manually update nginx configuration"
else
    echo "✅ Nginx configuration updated!"
fi

echo "🎉 Deployment completed!"
echo "🌐 Visit: https://f4u.online"

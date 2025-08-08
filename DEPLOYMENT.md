# Instagram Clone - Render Deployment Guide

## Prerequisites

1. **MongoDB Atlas Account**: Set up a free MongoDB Atlas cluster
2. **Cloudinary Account**: Set up a free Cloudinary account for image/video uploads
3. **Render Account**: Sign up at [render.com](https://render.com)

## Step 1: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Replace `your_username`, `your_password`, and `your_cluster` in the connection string

## Step 2: Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard

## Step 3: Deploy on Render

### Option A: Deploy via Render Dashboard

1. **Connect Your Repository**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

2. **Configure the Service**:
   - **Name**: `instagram-clone` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `chmod +x render-build.sh && ./render-build.sh`
   - **Start Command**: `npm start`
   - **Plan**: Free

3. **Set Environment Variables**:
   Add these environment variables in Render dashboard:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/instagram_clone?retryWrites=true&w=majority
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=https://your-app-name.onrender.com
   ```

### Option B: Deploy via Render Blueprint

1. Create a `render.yaml` file in your repository root:

```yaml
services:
  - type: web
    name: instagram-clone
    env: node
    buildCommand: chmod +x render-build.sh && ./render-build.sh
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        sync: false
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

## Step 4: Update API Configuration

The application is already configured to automatically detect the environment and use the correct API endpoints:

- **Development**: Uses `http://localhost:5000`
- **Production**: Uses the current domain (your Render URL)

## Step 5: Test Your Deployment

1. Wait for the build to complete (usually 5-10 minutes)
2. Visit your Render URL (e.g., `https://instagram-clone.onrender.com`)
3. Test the following features:
   - User registration and login
   - Creating posts with images/videos
   - Liking and commenting on posts
   - Profile updates

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are properly listed in package.json files
   - Ensure the render-build.sh script has execute permissions

2. **Database Connection Issues**:
   - Verify your MongoDB Atlas connection string
   - Ensure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all IPs)

3. **Image Upload Issues**:
   - Verify your Cloudinary credentials
   - Check that the CLOUDINARY_* environment variables are set correctly

4. **CORS Issues**:
   - Ensure CLIENT_URL is set to your Render domain
   - The server is configured to accept requests from the CLIENT_URL

### Environment Variables Reference:

| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Server port | 10000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | JWT signing secret | your_secret_key |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | your_cloud_name |
| CLOUDINARY_API_KEY | Cloudinary API key | your_api_key |
| CLOUDINARY_API_SECRET | Cloudinary API secret | your_api_secret |
| CLIENT_URL | Frontend URL | https://your-app.onrender.com |

## Security Notes

1. **JWT Secret**: Use a strong, random string for JWT_SECRET
2. **MongoDB**: Use a strong password for your database user
3. **Cloudinary**: Keep your API credentials secure
4. **Environment Variables**: Never commit sensitive data to your repository

## Performance Optimization

1. **MongoDB Atlas**: Use a cluster in a region close to your users
2. **Cloudinary**: Use appropriate image transformations for different screen sizes
3. **Render**: Consider upgrading to a paid plan for better performance

## Monitoring

- Use Render's built-in logs to monitor your application
- Set up alerts for downtime
- Monitor MongoDB Atlas metrics
- Track Cloudinary usage

Your Instagram clone should now be successfully deployed on Render! 🚀

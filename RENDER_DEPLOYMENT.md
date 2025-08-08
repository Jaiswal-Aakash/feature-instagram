# Instagram Clone - Render Deployment Guide (Monorepo)

This guide shows how to deploy both client and server from the same repository using Render's root directory feature.

## Prerequisites

1. **MongoDB Atlas Account**: Set up a free MongoDB Atlas cluster
2. **Cloudinary Account**: Set up a free Cloudinary account for image/video uploads
3. **Render Account**: Sign up at [render.com](https://render.com)
4. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up External Services

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Create a database user with read/write permissions
4. Get your connection string
5. Replace `your_username`, `your_password`, and `your_cluster` in the connection string

### Cloudinary Setup
1. Go to [Cloudinary](https://cloudinary.com)
2. Create a free account
3. Get your Cloud Name, API Key, and API Secret from the dashboard

## Step 2: Deploy Server on Render

### Server Configuration
1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing this project

3. **Configure Server Service**:
   - **Name**: `instagram-clone-server` (or your preferred name)
   - **Environment**: `Node`
   - **Root Directory**: `server` ⭐ **Important: Set this to `server`**
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Set Environment Variables**:
   Add these environment variables in Render dashboard:

   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/instagram_clone?retryWrites=true&w=majority
   JWT_SECRET=your_very_secure_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   CLIENT_URL=https://your-client-name.onrender.com
   ```

## Step 3: Deploy Client on Render

### Client Configuration
1. **Go to Render Dashboard**: [dashboard.render.com](https://dashboard.render.com)
2. **Create New Static Site**:
   - Click "New +" → "Static Site"
   - Connect the same GitHub repository
   - Select the same repository

3. **Configure Client Service**:
   - **Name**: `instagram-clone-client` (or your preferred name)
   - **Root Directory**: `client` ⭐ **Important: Set this to `client`**
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Plan**: Free

4. **Set Environment Variables**:
   Add this environment variable in Render dashboard:

   ```
   REACT_APP_API_URL=https://your-server-name.onrender.com
   ```

## Step 4: Update API Configuration

The client is configured to use the `REACT_APP_API_URL` environment variable. Make sure this points to your server's URL.

## Step 5: Test Your Deployment

### Test Server
1. Wait for the server build to complete (usually 5-10 minutes)
2. Test your API endpoints:
   - Health check: `https://your-server-name.onrender.com/api/health`
   - Should return: `{"message":"Instagram Clone API is running!","timestamp":"...","environment":"production"}`

### Test Client
1. Wait for the client build to complete (usually 3-5 minutes)
2. Visit your client URL (e.g., `https://instagram-clone-client.onrender.com`)
3. Test the following features:
   - User registration and login
   - Creating posts with images/videos
   - Liking and commenting on posts
   - Profile updates

## Alternative: Using Render Blueprint

You can also use a `render.yaml` file in your repository root:

```yaml
services:
  # Server Service
  - type: web
    name: instagram-clone-server
    env: node
    rootDir: server
    buildCommand: npm install
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

  # Client Service
  - type: web
    name: instagram-clone-client
    env: static
    rootDir: client
    buildCommand: npm install && npm run build
    staticPublishPath: ./build
    envVars:
      - key: REACT_APP_API_URL
        value: https://instagram-clone-server.onrender.com
```

## Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check that all dependencies are properly listed in package.json files
   - Ensure the root directory is set correctly (`server` for server, `client` for client)

2. **API Connection Issues**:
   - Verify REACT_APP_API_URL is set correctly
   - Ensure your server is running and accessible
   - Check CORS configuration on your server

3. **Database Connection Issues**:
   - Verify your MongoDB Atlas connection string
   - Ensure your IP is whitelisted in MongoDB Atlas (or use 0.0.0.0/0 for all IPs)

4. **Image Upload Issues**:
   - Verify your Cloudinary credentials
   - Check that the CLOUDINARY_* environment variables are set correctly

### Environment Variables Reference:

#### Server Variables:
| Variable | Description | Example |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| PORT | Server port | 10000 |
| MONGODB_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | JWT signing secret | your_secret_key |
| CLOUDINARY_CLOUD_NAME | Cloudinary cloud name | your_cloud_name |
| CLOUDINARY_API_KEY | Cloudinary API key | your_api_key |
| CLOUDINARY_API_SECRET | Cloudinary API secret | your_api_secret |
| CLIENT_URL | Frontend URL | https://instagram-clone-client.onrender.com |

#### Client Variables:
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_API_URL | Backend API URL | https://instagram-clone-server.onrender.com |

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

Your Instagram clone should now be successfully deployed on Render with both client and server running as separate services! 🚀

# Instagram Clone - MERN Stack Project

A full-stack Instagram clone built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring a dark theme interface and functional Create and Reels sections.

## Features

### 🎨 Interface
- **Dark Theme**: Modern Instagram-style dark interface
- **Responsive Design**: Works on desktop and mobile devices
- **Three-Column Layout**: Sidebar navigation, main content, and right sidebar

### 📱 Navigation
- **Sidebar Navigation**: Home, Search, Explore, Reels, Messages, Notifications, Create, Dashboard, Profile, More
- **Active State Management**: Visual feedback for current section
- **Notification Badge**: Messages section shows notification count

### ✨ Functional Features
- **Create Post Modal**: 
  - File upload (images/videos)
  - Caption input
  - Preview functionality
  - Post creation with backend integration
- **Reels Section**:
  - Video playback with play/pause controls
  - Like and save functionality
  - User interaction (follow, comment)
  - Vertical scrolling navigation
  - Multiple reel support

### 🏠 Home Feed
- **Stories Section**: Horizontal scrollable stories with gradient borders
- **Feed Posts**: Sample post with news content
- **Interactive Elements**: Like, comment, share, save buttons

### 👥 Right Sidebar
- **User Profile**: Current user info with switch account option
- **Suggested Accounts**: Follow suggestions with verification badges
- **Footer Links**: Instagram-style footer with links and copyright

## Tech Stack

### Frontend
- **React.js** with TypeScript
- **Lucide React** for icons
- **CSS3** for styling
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Multer** for file uploads
- **CORS** for cross-origin requests

## Project Structure

```
instagram-clone/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── features/   # Functional components
│   │   │   │   ├── CreatePost.tsx
│   │   │   │   └── Reels.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MainContent.tsx
│   │   │   └── RightSidebar.tsx
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js           # Main server file
│   ├── uploads/           # File upload directory
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd instagram-clone
   ```

2. **Install frontend dependencies**
   ```bash
   cd client
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../server
   npm install
   ```

4. **Set up environment variables**
   Create a `.env` file in the server directory:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/instagram-clone
   NODE_ENV=development
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm start
   ```
   The React app will run on `http://localhost:3000`

3. **Build for production**
   ```bash
   cd client
   npm run build
   ```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/upload` - Upload new post with media

### Reels
- `GET /api/reels` - Get all reels

### Health Check
- `GET /api/health` - API health status

## Features in Detail

### Create Post Modal
- **File Upload**: Supports images and videos up to 10MB
- **Preview**: Real-time preview of selected media
- **Caption**: Text input for post captions
- **Options**: Emoji, location, and people tagging (UI only)
- **Validation**: File type and size validation

### Reels Section
- **Video Playback**: HTML5 video with custom controls
- **Navigation**: Mouse wheel scrolling between reels
- **Interactions**: Like, comment, share, save functionality
- **User Info**: Display creator information and follow button
- **Progress Indicators**: Dot indicators for current reel position

## Customization

### Adding New Sections
1. Add new case in `MainContent.tsx` switch statement
2. Create corresponding component
3. Update navigation in `Sidebar.tsx`

### Styling
- All styles are in `App.css`
- Dark theme colors are defined in CSS variables
- Responsive breakpoints for mobile/tablet

### Backend Integration
- File uploads are stored in `server/uploads/`
- MongoDB models can be added for data persistence
- API routes can be extended for additional features

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Real-time messaging
- [ ] Story creation and viewing
- [ ] Search functionality
- [ ] User profiles and settings
- [ ] Comments and replies
- [ ] Direct messaging
- [ ] Push notifications
- [ ] Image filters and editing
- [ ] Video editing capabilities

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for educational purposes. Instagram is a trademark of Meta Platforms, Inc.

## Support

For questions or issues, please open an issue in the repository.

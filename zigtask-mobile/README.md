# ZigTask Mobile App

A modern React Native mobile application for task management with Kanban-style workflow, built with Expo and TypeScript.

## 🚀 Features

### ✅ **Authentication**
- Secure JWT-based authentication
- User registration and login
- Persistent login with Expo SecureStore
- Auto-logout on token expiration

### 📱 **Task Management**
- **FlatList with Swipe Actions** - Swipe left to edit or delete tasks
- **Status Management** - Tap status badge to cycle through (To Do → In Progress → Done)
- **Priority Levels** - High, Medium, Low priority with color coding
- **Due Dates** - Set and display task due dates
- **Rich Task Forms** - Create and edit tasks with validation

### 🔄 **Offline Support**
- **Cached Data** - Tasks cached locally for offline viewing
- **Offline Actions** - Queue create/update/delete actions when offline
- **Auto-Sync** - Automatically sync queued actions when back online
- **Offline Indicator** - Visual indicator when app is offline

### 🎨 **Modern UI/UX**
- **Native Feel** - iOS and Android platform conventions
- **Responsive Design** - Works on phones and tablets
- **Smooth Animations** - Gesture-based interactions
- **Loading States** - Professional loading indicators
- **Error Handling** - User-friendly error messages

### 🚢 **Navigation**
- **Tab Navigation** - Bottom tabs for main sections
- **Stack Navigation** - Nested navigation with modal forms
- **Auth Flow** - Automatic navigation based on auth state

## 🛠 Technology Stack

### **Core**
- **React Native** 0.79.5 with Expo 53
- **TypeScript** for type safety
- **React Navigation** v7 for navigation

### **State Management**
- **React Context** for authentication
- **React Hook Form** for form handling
- **Local State** with optimistic updates

### **Storage & Network**
- **Expo SecureStore** for secure JWT storage
- **AsyncStorage** for data caching
- **Axios** for HTTP requests
- **NetInfo** for network status detection

### **UI Components**
- **Expo Vector Icons** for iconography
- **React Native Gesture Handler** for swipe gestures
- **React Native Swipe List View** for swipeable list items
- **React Native Safe Area Context** for safe area handling

### **Utilities**
- **date-fns** for date formatting and manipulation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development)
- Android Studio & Emulator (for Android development)
- Expo Go app (for physical device testing)

## 🚀 Getting Started

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Configure API Endpoint**
Edit `src/utils/api.ts` to point to your backend:
```typescript
const API_BASE_URL = 'http://your-api-server.com:8000';
// For local development: 'http://localhost:8000'
// For physical device: 'http://YOUR_IP:8000'
```

### 3. **Start Development Server**
```bash
npm start
```

### 4. **Run on Device/Simulator**
```bash
# iOS Simulator
npm run ios

# Android Emulator  
npm run android

# Web (for testing)
npm run web
```

### 5. **Test on Physical Device**
- Install **Expo Go** from App Store/Play Store
- Scan QR code from terminal/browser

## 📱 App Structure

```
src/
├── components/          # Reusable UI components
│   ├── TaskItem.tsx    # Individual task display
│   └── TaskModal.tsx   # Task form modal
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx    # Root navigator
│   ├── AuthNavigator.tsx   # Auth flow navigation
│   ├── MainNavigator.tsx   # Main app navigation
│   └── TaskNavigator.tsx   # Task management navigation
├── screens/            # Screen components
│   ├── LoginScreen.tsx     # User login
│   ├── RegisterScreen.tsx  # User registration
│   ├── TaskListScreen.tsx  # Main task list with swipe actions
│   ├── TaskFormScreen.tsx  # Create/edit task form
│   └── ProfileScreen.tsx   # User profile & settings
├── services/           # API services
│   ├── authService.ts      # Authentication API calls
│   └── taskService.ts      # Task CRUD operations
├── types/              # TypeScript type definitions
│   └── index.ts           # Shared types & interfaces
└── utils/              # Utility functions
    ├── api.ts             # API client configuration
    ├── storage.ts         # Local storage utilities  
    └── network.ts         # Network status utilities
```

## 🔧 Key Features Implementation

### **Swipe Actions**
Tasks support swipe-to-reveal actions:
- **Swipe Left** → Reveals Edit and Delete buttons
- **Edit Button** → Opens task form for editing
- **Delete Button** → Shows confirmation dialog

### **Offline Support**
1. **Caching**: Tasks automatically cached on successful API calls
2. **Offline Detection**: Network status monitored in real-time
3. **Action Queueing**: CRUD operations queued when offline
4. **Auto-Sync**: Queued actions executed when connection restored

### **Status Management**
- **Visual Indicators**: Color-coded status badges
- **Quick Changes**: Tap status to cycle through states
- **Optimistic Updates**: UI updates immediately, syncs to server

### **Form Validation**
- **Real-time Validation**: Form validation with React Hook Form
- **Error Display**: Clear error messages for invalid inputs
- **Required Fields**: Title required, other fields optional

## 🔐 Security Features

- **Secure Storage**: JWT tokens stored in Expo SecureStore
- **Auto-logout**: Automatic logout on token expiration
- **Request Interceptors**: Automatic token attachment to API requests
- **Error Handling**: Proper handling of authentication errors

## 🚧 Development Notes

### **API Integration**
The app expects a REST API with these endpoints:
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration  
- `GET /tasks` - Fetch user tasks
- `POST /tasks` - Create new task
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task

### **Network Configuration**
For local development with physical devices:
1. Ensure your development machine and device are on the same network
2. Replace `localhost` with your machine's IP address in `api.ts`
3. Make sure your backend server accepts connections from your IP

### **Platform Differences**
- **iOS**: Uses native gesture handling and safe area
- **Android**: Custom styling for Material Design patterns
- **Expo Go**: Some features may behave differently than standalone builds

## 📱 Building for Production

### **Expo Build Service (EAS)**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure build
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### **App Store Deployment**
1. Create app store listings
2. Configure app icons and splash screens
3. Set up app signing certificates
4. Upload builds via EAS Submit

## 🐛 Known Issues

- **SwipeListView**: Occasional rendering issues on Android - use FlatList alternative if needed
- **Network Detection**: May show false offline status on some Android devices
- **Date Input**: Uses text input for dates - could be enhanced with native date picker

## 🔮 Future Enhancements

- [ ] **Push Notifications** for task reminders
- [ ] **Biometric Authentication** (Touch ID/Face ID)  
- [ ] **Task Categories** and filtering
- [ ] **Collaborative Tasks** with team members
- [ ] **Task Templates** for recurring tasks
- [ ] **Dark Mode** support
- [ ] **Export/Import** functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting guide in the wiki

---

**Built with ❤️ using React Native & Expo** 
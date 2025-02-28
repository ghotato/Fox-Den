# FoxDen Setup Guide

This guide provides detailed instructions for setting up, running, and packaging the FoxDen desktop application.

## Development Environment Setup

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+ recommended)
- **Node.js**: v14.x or higher
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 1GB free space for development

### Setting Up Development Environment

1. **Install Node.js and npm**
   - Download and install from [Node.js website](https://nodejs.org/)
   - Verify installation:
     ```
     node --version
     npm --version
     ```

2. **Clone the Repository**
   ```
   git clone https://github.com/yourusername/foxden.git
   cd foxden
   ```

3. **Install Dependencies**
   ```
   npm install
   ```

4. **Create Required Directories**
   ```
   mkdir -p src/assets/icons/png
   mkdir -p src/assets/icons/mac
   mkdir -p src/assets/icons/win
   ```

5. **Add Placeholder Icons**
   
   For development, you can use placeholder icons. For production, replace these with your actual app icons.
   
   - Create a simple 16x16, 32x32, 64x64, 128x128, and 256x256 PNG icons in `src/assets/icons/png/`
   - For macOS, add an .icns file in `src/assets/icons/mac/icon.icns`
   - For Windows, add an .ico file in `src/assets/icons/win/icon.ico`

## Running the Application

### Development Mode

Run the application in development mode with hot reloading:
```
npm run dev
```

### Production Mode

Run the built application in production mode:
```
npm start
```

## Building the Application

### Building for All Platforms

```
npm run build
```

This will create distributables for your current platform in the `dist` directory.

### Platform-Specific Builds

#### Windows
```
npm run build:win
```
This creates:
- `.exe` installer in `dist/`
- Portable `.exe` in `dist/`

#### macOS
```
npm run build:mac
```
This creates:
- `.dmg` installer in `dist/`
- `.app` application in `dist/mac/`

#### Linux
```
npm run build:linux
```
This creates:
- `.AppImage` file in `dist/`
- `.deb` package in `dist/`
- `.rpm` package in `dist/`

## Configuration Options

### Electron Builder Configuration

The build configuration is defined in `package.json` under the `"build"` key. You can customize:

- Application ID
- Product name
- Icons and resources
- File associations
- Platform-specific options

### Application Configuration

Application settings are stored and managed using `electron-store`. Default settings can be modified in `main.js`.

## Troubleshooting

### Common Issues

1. **"Cannot find module" errors**
   - Run `npm install` again
   - Check if the module is listed in package.json

2. **White screen when launching**
   - Check the developer console for errors (Ctrl+Shift+I or Cmd+Option+I)
   - Verify all paths in main.js are correct

3. **Build fails**
   - Ensure you have the required system dependencies for electron-builder
   - For Linux builds, you might need `rpmbuild` or other packages
   - For macOS builds on non-macOS platforms, you cannot build macOS distributables

4. **Failed to load resource**
   - Check that all file paths are relative to the application structure
   - Use path.join() with __dirname for file paths in main process

### Getting Help

If you encounter issues not covered here:
1. Check the Electron documentation: https://www.electronjs.org/docs
2. Search for errors on Stack Overflow
3. Open an issue in the GitHub repository

## Next Steps After Setup

Once you have the application running:

1. **Customize the branding**: Update logos, icons, and product name
2. **Configure backend services**: Set up your own socket.io server for messaging
3. **Implement authentication**: Add a proper authentication system
4. **Enable voice/video**: Configure TURN/STUN servers for WebRTC connections

## Security Considerations

When preparing for production:

1. **Code signing**: Sign your application for distribution
2. **Content Security Policy**: Implement a CSP in your HTML files
3. **Context isolation**: Ensure it's enabled (it is by default in this template)
4. **API security**: Validate all data passed between processes

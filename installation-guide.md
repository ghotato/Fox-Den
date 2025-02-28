# FoxDen Installation Guide

This guide explains how to install and start using the FoxDen chat application on different platforms.

## Windows Installation

### System Requirements
- Windows 10 or newer
- 4GB RAM
- 500MB free disk space

### Installation Steps
1. Download the latest FoxDen installer (`FoxDen-Setup-x.x.x.exe`) from the [releases page](https://github.com/yourusername/foxden/releases)
2. Double-click the installer and follow the on-screen instructions
3. Choose your preferred installation location when prompted
4. Wait for the installation to complete
5. Launch FoxDen from the Start menu or desktop shortcut

### Portable Version
If you prefer not to install the application:
1. Download the portable version (`FoxDen-x.x.x-win.zip`)
2. Extract the ZIP file to your preferred location
3. Run `FoxDen.exe` to start the application

## macOS Installation

### System Requirements
- macOS 10.13 (High Sierra) or newer
- 4GB RAM
- 500MB free disk space

### Installation Steps
1. Download the latest FoxDen DMG file (`FoxDen-x.x.x.dmg`) from the [releases page](https://github.com/yourusername/foxden/releases)
2. Double-click the DMG file to mount it
3. Drag the FoxDen application to your Applications folder
4. Eject the disk image
5. Open FoxDen from your Applications folder

### First Launch Security
When launching for the first time, macOS may show a security warning:
1. If this happens, open System Preferences > Security & Privacy
2. Click "Open Anyway" for FoxDen
3. Confirm your decision in the dialog that appears

## Linux Installation

### System Requirements
- Ubuntu 18.04+, Debian 10+, Fedora 30+, or other modern Linux distributions
- 4GB RAM
- 500MB free disk space

### AppImage Installation (Any distro)
1. Download the latest AppImage file (`FoxDen-x.x.x.AppImage`) from the [releases page](https://github.com/yourusername/foxden/releases)
2. Make the file executable: `chmod +x FoxDen-x.x.x.AppImage`
3. Run the application: `./FoxDen-x.x.x.AppImage`

### Debian/Ubuntu Installation
1. Download the latest DEB package (`foxden_x.x.x_amd64.deb`) from the [releases page](https://github.com/yourusername/foxden/releases)
2. Install using your package manager:
   ```
   sudo apt install ./foxden_x.x.x_amd64.deb
   ```
3. Launch FoxDen from your applications menu

### Fedora/RHEL Installation
1. Download the latest RPM package (`foxden-x.x.x.x86_64.rpm`) from the [releases page](https://github.com/yourusername/foxden/releases)
2. Install using your package manager:
   ```
   sudo dnf install ./foxden-x.x.x.x86_64.rpm
   ```
3. Launch FoxDen from your applications menu

## Getting Started With FoxDen

### First Launch
1. When you first open FoxDen, you'll be prompted to create an account or sign in
2. Follow the on-screen instructions to set up your profile
3. Choose a username and add an optional avatar

### Joining a Den
1. Click the "+" button in the server list to join an existing Den
2. Enter an invite code provided by a friend or Den owner
3. Alternatively, create your own Den by selecting "Create a Den"

### Creating Channels
1. Right-click on a Den and select "Create Channel"
2. Choose between Text or Voice channel types
3. Give your channel a name and optional description
4. Set channel permissions if needed

### Using Voice & Video
1. Join a voice channel by clicking on it
2. Use the controls at the bottom to:
   - Toggle your microphone (M)
   - Toggle your camera (V)
   - Share your screen (S)
   - Adjust audio settings

### Customizing FoxDen
1. Access settings by clicking the gear icon near your username
2. Customize your profile, appearance, notifications, and more
3. Try both light and dark themes to see which you prefer

## Troubleshooting

### Application Won't Start
- Check if your system meets the minimum requirements
- Try reinstalling the application
- Verify you have the necessary permissions

### No Sound in Voice Channels
- Check if the correct microphone and speakers are selected in settings
- Ensure your device permissions allow FoxDen to access your microphone
- Restart the application if audio devices were connected after starting

### Video Not Working
- Check if your webcam is properly connected
- Ensure FoxDen has permission to access your camera
- Try selecting a different camera in the settings if multiple are available

### High CPU/Memory Usage
- Close other resource-intensive applications
- Check for application updates that may include performance improvements
- Disable hardware acceleration in settings if your GPU is causing issues

## Updates

FoxDen will automatically check for updates when launched. When a new version is available:

1. You'll see a notification in the application
2. Click "Update Now" to download and install the update
3. The application will restart automatically when the update is complete

You can also manually check for updates in Help > Check for Updates.

## Uninstalling

### Windows
1. Open Control Panel > Programs > Programs and Features
2. Select FoxDen and click "Uninstall"
3. Follow the uninstallation wizard

### macOS
1. Open the Applications folder in Finder
2. Drag FoxDen to the Trash
3. Empty the Trash

### Linux
- For DEB packages: `sudo apt remove foxden`
- For RPM packages: `sudo dnf remove foxden`
- For AppImage: Simply delete the AppImage file

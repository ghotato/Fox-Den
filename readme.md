# FoxDen - Discord-like Desktop Chat Application

FoxDen is a cross-platform desktop chat application similar to Discord, built using Electron, HTML, CSS, and JavaScript. It features a modern interface with support for text channels, voice/video chat, screen sharing, and extensive customization options.

![FoxDen Screenshot](screenshot.png)

## Features

- **Modern UI**: Clean, responsive design with dark and light mode support
- **Text Chat**: Real-time messaging with rich text formatting and emoji support
- **Voice & Video**: Voice chat, video calls, and screen sharing capabilities
- **Organizational Structure**: Den (server) and channel organization system
- **User Management**: User profiles, status settings, and friends list
- **Customization**: Extensive settings and personalization options
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm (usually comes with Node.js)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/foxden.git
   cd foxden
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```

### Building for Production

Build for the current platform:
```
npm run build
```

Build for specific platforms:
```
npm run build:win
npm run build:mac
npm run build:linux
```

The packaged applications will be created in the `dist` folder.

## Project Structure

```
foxden/
├── package.json              # Project configuration
├── main.js                   # Electron main process
├── preload.js                # Preload script for secure context bridge
├── src/
│   ├── index.html            # Main HTML file
│   ├── css/                  # CSS styles
│   ├── js/                   # JavaScript files
│   └── assets/               # Images, icons, sounds
└── electron/                 # Electron-specific code
```

## Technologies Used

- Electron - Cross-platform desktop app framework
- HTML5, CSS3, JavaScript - Core web technologies
- WebRTC - Real-time communication for voice and video
- Socket.io-client - For real-time messaging

## Extending for Mobile

The current version is focused on desktop, but the code has been structured with future mobile development in mind. To create mobile apps:

1. The core UI components use responsive design principles
2. State management is platform-agnostic
3. Core business logic is separated from UI rendering

For Android and iOS development, consider using:
- React Native with the existing UI components adapted
- NativeScript with the existing JavaScript logic
- Flutter with a reimplementation of the UI

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

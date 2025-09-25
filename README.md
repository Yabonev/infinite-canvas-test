# Infinite Canvas Diagram

🚀 A keyboard-first infinite canvas application for visualizing code relationships and creating diagrams with unparalleled speed and efficiency.

[![CI Pipeline](https://github.com/yourusername/infinite-canvas-diagram/actions/workflows/ci.yml/badge.svg)](https://github.com/yourusername/infinite-canvas-diagram/actions/workflows/ci.yml)
[![Coverage](https://codecov.io/gh/yourusername/infinite-canvas-diagram/branch/main/graph/badge.svg)](https://codecov.io/gh/yourusername/infinite-canvas-diagram)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **🎹 Keyboard-First Design**: Navigate and create diagrams without touching the mouse
- **♾️ Infinite Canvas**: Unlimited space for your ideas with smooth pan and zoom
- **🔗 Smart Connections**: Create relationships between shapes with intelligent routing
- **🎯 Auto-Focus Camera**: Automatically follows your selection with smooth animations
- **📐 Auto-Layout**: Multiple layout algorithms for instant organization
- **🎨 Beautiful Themes**: Light/dark modes with customizable color schemes
- **♿ Accessible**: Full WCAG 2.1 AA compliance with screen reader support
- **⚡ Fast**: 60fps performance with hundreds of shapes
- **💾 Auto-Save**: Never lose your work with automatic persistence
- **📤 Export Options**: PNG, SVG, PDF, and code generation

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm 10+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/infinite-canvas-diagram.git
cd infinite-canvas-diagram

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## ⌨️ Keyboard Shortcuts

### Navigation
| Shortcut | Action |
|----------|--------|
| `Arrow Keys` | Navigate between shapes |
| `Tab` / `Shift+Tab` | Sequential navigation |
| `f` | Focus on selected shape |
| `Home` / `End` | Jump to first/last shape |

### Creation
| Shortcut | Action |
|----------|--------|
| `c` | Create class |
| `m` | Create method |
| `i` | Create interface |
| `Enter` | Create connected shape |
| `Ctrl+Enter` | Start connection mode |

### Editing
| Shortcut | Action |
|----------|--------|
| `F2` | Edit selected shape |
| `Delete` | Delete selected |
| `Ctrl+C` / `Ctrl+V` | Copy/Paste |
| `Ctrl+Z` / `Ctrl+Y` | Undo/Redo |

### View
| Shortcut | Action |
|----------|--------|
| `Ctrl+0` | Reset zoom |
| `Ctrl+Plus` / `Ctrl+Minus` | Zoom in/out |
| `z` | Zoom to fit all |

Press `?` at any time to see the complete keyboard shortcut guide.

## 🧑‍💻 Development

### Project Structure

```
src/
├── core/          # Core business logic
├── components/    # React components
├── hooks/         # Custom React hooks
├── stores/        # State management (Zustand)
├── utils/         # Utility functions
└── types/         # TypeScript definitions
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test            # Run all tests
npm run test:unit   # Run unit tests
npm run test:e2e    # Run E2E tests
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint        # Run ESLint
npm run lint:fix    # Fix linting issues
npm run format      # Format with Prettier
npm run type-check  # TypeScript type checking
```

### AI-Assisted Development

This project follows an AI-assisted development workflow. See [AGENTS.md](./AGENTS.md) for detailed instructions on:

- Task execution protocols
- Testing strategies with Playwright MCP
- PR creation guidelines
- CI/CD integration

### Testing

#### Unit Tests
```bash
npm test -- --watch  # Run tests in watch mode
```

#### E2E Tests with Playwright
```bash
npm run test:e2e -- --headed  # Run with browser visible
npm run test:e2e -- --debug   # Debug mode
```

#### Using Playwright MCP
The project integrates with Playwright MCP for browser automation during development. See [AGENTS.md](./AGENTS.md#playwright-mcp-integration) for usage patterns.

## 🚢 Deployment

### Branch Strategy

- `main` - Production branch (protected)
- `develop` - Development branch
- `feature/*` - Feature branches

### CI/CD Pipeline

All pull requests trigger:
1. Linting and type checking
2. Unit tests with coverage
3. E2E tests across browsers
4. Performance tests
5. Security scanning
6. Bundle size validation

### Environments

- **Production**: https://infinite-canvas.app
- **Staging**: https://staging.infinite-canvas.app
- **Local**: http://localhost:5173

## 📊 Performance

### Targets

- **Frame Rate**: 60fps with 100+ shapes
- **Load Time**: <2 seconds initial load
- **Bundle Size**: <500KB gzipped
- **Memory Usage**: <100MB for typical diagrams

### Monitoring

Performance metrics are tracked via:
- Web Vitals (LCP, FID, CLS)
- Custom metrics (shape creation time, navigation latency)
- Error tracking with Sentry

## ♿ Accessibility

The application is designed to be fully accessible:

- ✅ 100% keyboard navigable
- ✅ Screen reader compatible
- ✅ WCAG 2.1 AA compliant
- ✅ High contrast mode support
- ✅ Customizable shortcuts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Commit your changes following our commit conventions
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📝 Documentation

- [Architecture Overview](./docs/architecture/README.md)
- [API Documentation](./docs/api/README.md)
- [User Guide](./docs/guides/user-guide.md)
- [Development Guide](./docs/guides/development.md)
- [AI Agent Workflow](./AGENTS.md)

## 🐛 Troubleshooting

### Common Issues

**Build fails with "out of memory" error**
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Playwright tests fail to run**
```bash
npx playwright install --with-deps
```

**Port 5173 already in use**
```bash
# Change port in vite.config.ts or use
npm run dev -- --port 3000
```

See [Troubleshooting Guide](./docs/troubleshooting.md) for more solutions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Konva.js](https://konvajs.org/) for the powerful 2D canvas library
- [React](https://react.dev/) for the UI framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Playwright](https://playwright.dev/) for E2E testing
- The open source community for inspiration and contributions

## 📞 Support

- 📧 Email: support@infinite-canvas.app
- 💬 Discord: [Join our community](https://discord.gg/infinite-canvas)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/infinite-canvas-diagram/issues)

---

Built with ❤️ by the Infinite Canvas Team
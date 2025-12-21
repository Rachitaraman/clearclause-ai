# ClearClause AI - Clean Project Structure

## Core Application Files

### Configuration
- `package.json` - Project dependencies and scripts
- `vite.config.js` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `.env` - Environment variables
- `.gitignore` - Git ignore patterns

### Frontend Application
- `index.html` - Main HTML entry point
- `src/` - React application source code
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point
  - `components/` - React components
  - `utils/` - Utility functions
  - `styles/` - CSS styles

### Backend Functions
- `functions/process.js` - Main backend processing function
- `api/` - API route handlers
- `routes/` - Application routes

### Testing
- `test/` - Test files
- `test-setup.js` - Test configuration

### Static Assets
- `public/` - Static files and assets

## Removed Files
- All log files (*.log)
- Temporary test files (test-*.js)
- Documentation summaries (*_SUMMARY.md, *_GUIDE.md)
- Demo and debug files
- Archive files (*.zip)
- Sample data files (*.csv)
- CUAD dataset folder
- Model training folders
- Duplicate configuration files

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
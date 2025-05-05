# Bell24h Project Export Instructions

## Exporting the Project from Replit

Follow these steps to export the complete Bell24h project from Replit:

### 1. Using Replit's Download Feature

1. **Download as ZIP**
   - In the Replit file sidebar, click the three dots (⋮) and select "Download as zip"
   - This will download most of the project files

2. **Check Important Files**
   - Open the `export/important_files.txt` to see a complete list of important files
   - If any files are missing from your download, download them individually:
     - Right-click on the file in Replit's file explorer
     - Select "Download"

### 2. Setting Up Locally

1. **Project Structure**
   Make sure your local project has this structure:
   ```
   bell24h/
   ├── client/
   │   └── src/
   │       ├── components/
   │       ├── hooks/
   │       ├── lib/
   │       ├── pages/
   │       ├── App.tsx
   │       ├── index.css
   │       └── main.tsx
   ├── server/
   │   ├── routes/
   │   ├── index.ts
   │   ├── routes.ts
   │   ├── storage.ts
   │   └── vite.ts
   ├── shared/
   │   └── schema.ts
   ├── .env.example
   ├── package.json
   ├── tsconfig.json
   ├── vite.config.js
   └── bell24h-unified-startup.js
   ```

2. **Install Dependencies**
   ```
   npm install
   ```

3. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Update the environment variables:
     ```
     DATABASE_URL=postgresql://username:password@host:port/database
     SESSION_SECRET=your_secure_session_secret
     OPENAI_API_KEY=your_openai_api_key
     ```

4. **Start Development Server**
   ```
   node bell24h-unified-startup.js
   ```

5. **Build for Production**
   To build the application for production:
   ```
   # First, make sure @tanstack/react-query is installed
   npm install @tanstack/react-query
   
   # Then build the client
   cd client && npm run build
   ```

## Bell24h Features

1. **Voice-Based RFQ**
   - Multilingual support (Hindi/English)
   - Audio quality enhancement
   - Language detection and translation

2. **Enhanced User Roles & Permissions**
   - Multi-level organizational hierarchy
   - Role management (owner/admin/manager/member/viewer)
   - ACL implementation with granular resource permissions

3. **Voice Analytics Dashboard**
   - Analysis of voice RFQ submissions
   - Performance metrics and reporting

4. **Blockchain Integration**
   - Secure contracts via Polygon
   - Transparent record keeping

5. **Organization Management**
   - Team hierarchies
   - Permission inheritance

## Troubleshooting

If you encounter issues with dependencies:
1. Make sure all packages in `package.json` are installed
2. Check that environment variables are properly set
3. Ensure database connection is configured correctly

For further assistance, refer to the project documentation or contact support.

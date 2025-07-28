const fs = require('fs');
const path = require('path');

const logosDir = path.join(__dirname, '../public/images/clients');

// Create directories if they don't exist
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

// Create SVG logos
const logos = [
  { name: 'techcorp', color: '#3B82F6' },
  { name: 'innovatex', color: '#10B981' },
  { name: 'globaltech', color: '#8B5CF6' },
  { name: 'nexus', color: '#EC4899' },
  { name: 'vertex', color: '#F59E0B' },
];

logos.forEach(logo => {
  const svg = `
    <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="100" rx="10" fill="${logo.color}20"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="${logo.color}">
        ${logo.name.charAt(0).toUpperCase() + logo.name.slice(1)}
      </text>
    </svg>
  `;
  
  fs.writeFileSync(path.join(logosDir, `${logo.name}.svg`), svg.trim());
});

console.log('Generated client logos in', logosDir);

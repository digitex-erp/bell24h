// Script to verify all components used in the home page are properly exported

const fs = require('fs');
const path = require('path');

// List of components used in the home page
const homePageComponents = [
  'Navigation',
  'HeroSection',
  'FeaturesSection',
  'HowItWorksSection',
  'CategoriesSection',
  'TestimonialsSection',
  'CallToActionSection',
  'Footer'
];

// Base directory for components
const componentsDir = path.join(__dirname, '..', 'src', 'components', 'home');

// Check if each component exists and is properly exported
async function checkComponentExports() {
  console.log('🔍 Checking component exports...\n');
  
  const results = await Promise.all(
    homePageComponents.map(async (componentName) => {
      const filePath = path.join(componentsDir, `${componentName}.tsx`);
      const exists = fs.existsSync(filePath);
      
      if (!exists) {
        return { componentName, status: '❌ Not Found', filePath };
      }
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const isExported = 
          fileContent.includes(`export const ${componentName}`) || 
          fileContent.includes(`export default function ${componentName}`) ||
          fileContent.includes(`export default ${componentName}`);
        
        return {
          componentName,
          status: isExported ? '✅ Exported' : '❌ Not Exported',
          filePath: path.relative(process.cwd(), filePath)
        };
      } catch (error) {
        return { componentName, status: '❌ Error', error: error.message };
      }
    })
  );

  // Display results
  console.table(results);
  
  // Check for any failures
  const failures = results.filter(r => !r.status.startsWith('✅'));
  if (failures.length > 0) {
    console.log('\n❌ Some components have issues:');
    failures.forEach(f => {
      console.log(`- ${f.componentName}: ${f.status}`);
      if (f.error) console.log(`  Error: ${f.error}`);
      if (f.filePath) console.log(`  Path: ${f.filePath}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All components are properly exported!');
  }
}

// Run the check
checkComponentExports().catch(console.error);

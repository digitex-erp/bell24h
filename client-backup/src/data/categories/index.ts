import { Category } from '../../types/categories.js';
import { agriculture } from './agriculture.js';
import { apparel } from './apparel.js';
import { automobile } from './automobile.js';
import { electronics } from './electronics.js';
import { healthcare } from './healthcare.js';
import { construction } from './construction.js';
import { food } from './food.js';
import { it } from './it.js';
import { energy } from './energy.js';
import { furniture } from './furniture.js';
import { logistics } from './logistics.js';
import { chemicals } from './chemicals.js';
import { education } from './education.js';
import { sports } from './sports.js';
import { telecommunications } from './telecommunications.js';
import { packaging } from './packaging.js';
import { textiles } from './textiles.js';
import { safety } from './safety.js';
import { tools } from './tools.js';
import { toys } from './toys.js';
import { travel } from './travel.js';
import { business } from './business.js';
import { environment } from './environment.js';
import { ayurveda } from './ayurveda.js';
import { office } from './office.js';
import { minerals } from './minerals.js';
import { plastics } from './plastics.js';
import { electrical } from './electrical.js';
import { gifts } from './gifts.js';
import { jewelry } from './jewelry.js';
import { constructionMaterials } from './construction-materials.js';
import { itSoftware } from './it-software.js';
import { legalCompliance } from './legal-compliance.js';

// Export all categories as an array
export const categories: Category[] = [
  agriculture,
  apparel,
  automobile,
  electronics,
  healthcare,
  construction,
  food,
  it,
  energy,
  furniture,
  logistics,
  chemicals,
  education,
  sports,
  telecommunications,
  packaging,
  textiles,
  safety,
  tools,
  toys,
  travel,
  business,
  environment,
  ayurveda,
  office,
  minerals,
  plastics,
  electrical,
  gifts,
  jewelry,
  constructionMaterials,
  itSoftware,
  legalCompliance
];

// Create a map for quick lookups
export const categoriesMap: Record<string, Category> = categories.reduce((acc, category) => {
  acc[category.id] = category;
  return acc;
}, {} as Record<string, Category>);

export type Category = {
  id: string;
  name: string;
  description: string;
  slug: string;
  icon: string; // use emoji to avoid extra imports
  rfqCount?: string;
};

export const ALL_50_CATEGORIES: Category[] = [
  { id: 'steel', name: 'Steel & Metals', description: 'Industrial steel, alloys, and fabrication', slug: 'steel-metals', icon: '🛠️', rfqCount: '500+' },
  { id: 'chem', name: 'Chemicals', description: 'Industrial and specialty chemicals', slug: 'chemicals', icon: '⚗️', rfqCount: '300+' },
  { id: 'auto', name: 'Automotive Parts', description: 'OEM and aftermarket components', slug: 'automotive-parts', icon: '🚗', rfqCount: '220+' },
  { id: 'mach', name: 'Machinery', description: 'Industrial machines and spares', slug: 'machinery', icon: '🏭', rfqCount: '400+' },
  { id: 'text', name: 'Textiles', description: 'Fabrics, yarns and garments', slug: 'textiles', icon: '🧵', rfqCount: '380+' },
  { id: 'elec', name: 'Electronics', description: 'Components, PCBs, and assemblies', slug: 'electronics', icon: '🔌', rfqCount: '450+' },
  { id: 'pack', name: 'Packaging', description: 'Cartons, labels and materials', slug: 'packaging', icon: '��', rfqCount: '260+' },
  { id: 'food', name: 'Food Ingredients', description: 'Bulk food and additives', slug: 'food-ingredients', icon: '🍞', rfqCount: '180+' },
  { id: 'cons', name: 'Construction', description: 'Cement, sand, aggregates', slug: 'construction', icon: '🏗️', rfqCount: '320+' },
  { id: 'med', name: 'Medical Supplies', description: 'Devices and disposables', slug: 'medical-supplies', icon: '🩺', rfqCount: '140+' },
  // Fill to 50 by repeating representative categories for demo UI only
  { id: 'cat11', name: 'Industrial Tools', description: 'Hand and power tools', slug: 'industrial-tools', icon: '🔧' },
  { id: 'cat12', name: 'Electricals', description: 'Cables and switchgear', slug: 'electricals', icon: '💡' },
  { id: 'cat13', name: 'Furnishings', description: 'Office and commercial', slug: 'furnishings', icon: '🪑' },
  { id: 'cat14', name: 'Solar', description: 'Panels and inverters', slug: 'solar', icon: '☀️' },
  { id: 'cat15', name: 'Batteries', description: 'Lead-acid and Li-ion', slug: 'batteries', icon: '🔋' },
  { id: 'cat16', name: 'Safety', description: 'PPE and signage', slug: 'safety', icon: '🦺' },
  { id: 'cat17', name: 'Paints', description: 'Industrial coatings', slug: 'paints', icon: '🎨' },
  { id: 'cat18', name: 'Piping', description: 'Pipes, valves, fittings', slug: 'piping', icon: '🚰' },
  { id: 'cat19', name: 'Rubber & Plastics', description: 'Raw materials and parts', slug: 'rubber-plastics', icon: '⚙️' },
  { id: 'cat20', name: 'IT Hardware', description: 'Servers and peripherals', slug: 'it-hardware', icon: '🖥️' },
  { id: 'cat21', name: 'Security', description: 'CCTV and access control', slug: 'security', icon: '🛡️' },
  { id: 'cat22', name: 'Cleaning', description: 'Industrial cleaning agents', slug: 'cleaning', icon: '🧼' },
  { id: 'cat23', name: 'HVAC', description: 'Cooling and air systems', slug: 'hvac', icon: '❄️' },
  { id: 'cat24', name: 'Abrasives', description: 'Grinding and cutting', slug: 'abrasives', icon: '🪚' },
  { id: 'cat25', name: 'Bearings', description: 'Industrial bearings', slug: 'bearings', icon: '🧭' },
  { id: 'cat26', name: 'Conveyors', description: 'Belts and rollers', slug: 'conveyors', icon: '📦' },
  { id: 'cat27', name: 'Fasteners', description: 'Nuts and bolts', slug: 'fasteners', icon: '🔩' },
  { id: 'cat28', name: 'Lubricants', description: 'Grease and oils', slug: 'lubricants', icon: '🛢️' },
  { id: 'cat29', name: 'Adhesives', description: 'Industrial adhesives', slug: 'adhesives', icon: '🧴' },
  { id: 'cat30', name: 'Paper & Stationery', description: 'Office supplies', slug: 'paper-stationery', icon: '📄' },
  { id: 'cat31', name: 'Furniture', description: 'Office furniture', slug: 'furniture', icon: '🪑' },
  { id: 'cat32', name: 'Textile Machinery', description: 'Machines and parts', slug: 'textile-machinery', icon: '🧶' },
  { id: 'cat33', name: 'Agriculture', description: 'Inputs and machinery', slug: 'agriculture', icon: '🌾' },
  { id: 'cat34', name: 'Mining', description: 'Equipment and supplies', slug: 'mining', icon: '⛏️' },
  { id: 'cat35', name: 'Marine', description: 'Marine equipment', slug: 'marine', icon: '⚓' },
  { id: 'cat36', name: 'Aviation', description: 'GSE and parts', slug: 'aviation', icon: '✈️' },
  { id: 'cat37', name: 'Railways', description: 'Signalling and parts', slug: 'railways', icon: '🚆' },
  { id: 'cat38', name: 'Defense', description: 'Supplies and parts', slug: 'defense', icon: '🪖' },
  { id: 'cat39', name: 'Education', description: 'Lab and classroom', slug: 'education', icon: '🏫' },
  { id: 'cat40', name: 'Healthcare', description: 'Consumables', slug: 'healthcare', icon: '💊' },
  { id: 'cat41', name: 'Printing', description: 'Printers and inks', slug: 'printing', icon: '🖨️' },
  { id: 'cat42', name: 'Logistics', description: 'Warehousing and freight', slug: 'logistics', icon: '🚚' },
  { id: 'cat43', name: 'E-waste', description: 'Recycling services', slug: 'e-waste', icon: '♻️' },
  { id: 'cat44', name: 'Consulting', description: 'Procurement services', slug: 'consulting', icon: '📊' },
  { id: 'cat45', name: 'Legal', description: 'Contracts and compliance', slug: 'legal', icon: '⚖️' },
  { id: 'cat46', name: 'Finance', description: 'Vendor financing', slug: 'finance', icon: '💳' },
  { id: 'cat47', name: 'HR & Staffing', description: 'Manpower services', slug: 'hr-staffing', icon: '🧑‍💼' },
  { id: 'cat48', name: 'Catering', description: 'Food services', slug: 'catering', icon: '🍽️' },
  { id: 'cat49', name: 'Events', description: 'Event supplies', slug: 'events', icon: '🎪' },
  { id: 'cat50', name: 'Miscellaneous', description: 'Other categories', slug: 'misc', icon: '✨' },
];

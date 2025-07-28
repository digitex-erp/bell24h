import React, { useState } from 'react';
import { FileText, Plus, Check } from 'lucide-react';

interface RfqCreationProps {
  onComplete: () => void;
  onSkip: () => void;
  data: any;
  onDataChange: (data: any) => void;
}

const RfqCreation: React.FC<RfqCreationProps> = ({
  onComplete,
  onSkip,
  data,
  onDataChange
}) => {
  const [formData, setFormData] = useState({
    title: data.title || '',
    category: data.category || '',
    description: data.description || '',
    quantity: data.quantity || '',
    budget: data.budget || '',
    deadline: data.deadline || ''
  });
  
  const [formValid, setFormValid] = useState(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    onDataChange({
      ...data,
      [name]: value
    });
    
    validateForm({
      ...formData,
      [name]: value
    });
  };

  // Validate form
  const validateForm = (data: any) => {
    const requiredFields = ['title', 'category', 'description', 'quantity'];
    const isValid = requiredFields.every(field => data[field] && data[field].trim() !== '');
    
    setFormValid(isValid);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formValid) {
      // In a real implementation, you would save the RFQ data to the backend
      // For now, we'll just call onComplete
      onComplete();
    }
  };

  // Product categories
  const categories = [
    'Electronics',
    'Machinery',
    'Raw Materials',
    'Packaging',
    'Textiles',
    'Chemicals',
    'Automotive',
    'Construction',
    'Food & Beverage',
    'Medical Supplies',
    'Other'
  ];

  return (
    <div className="onboarding-step-module">
      <h2 className="step-title">Create Your First RFQ</h2>
      <p className="step-description">
        Submit a Request for Quotation to find the best suppliers for your needs. Be specific about your requirements to get accurate quotes.
      </p>
      
      <form className="onboarding-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>RFQ Details</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">RFQ Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., 'Industrial Pumps for Water Treatment Plant'"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Product Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="quantity">Quantity *</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                placeholder="e.g., 100"
                min="1"
                required
              />
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="description">Product Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe the product specifications, quality requirements, etc."
                required
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="budget">Budget (Optional)</label>
              <input
                type="text"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g., $10,000"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="deadline">Deadline (Optional)</label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h3>RFQ Tips</h3>
          <div className="rfq-tips">
            <ul>
              <li>Be specific about product specifications and requirements</li>
              <li>Include quantity, quality standards, and delivery timeline</li>
              <li>Mention any certification or compliance requirements</li>
              <li>Add images or diagrams if available (you can do this after onboarding)</li>
              <li>Consider adding a video RFQ for complex requirements</li>
            </ul>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={!formValid}
          >
            <Check size={20} />
            Submit RFQ
          </button>
          
          <button 
            type="button" 
            className="save-draft-button"
            onClick={() => {
              // In a real implementation, you would save the draft
              // For now, we'll just call onComplete
              onComplete();
            }}
          >
            <Plus size={20} />
            Save as Draft
          </button>
        </div>
        
        <div className="form-validation-message">
          {!formValid && (
            <p>Please fill in all required fields marked with *</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default RfqCreation;

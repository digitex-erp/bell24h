'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [marketplaceRole, setMarketplaceRole] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    gstin: '',
    pan: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    businessType: '',
    annualTurnover: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    // Electronics & Technology
    'Electronics & Components',
    'Semiconductors & ICs',
    'PCB & Circuit Boards',
    'LED & Lighting',
    'Telecommunications',
    'Computer Hardware',
    'Software & IT Services',
    'IoT & Smart Devices',

    // Manufacturing & Machinery
    'Industrial Machinery',
    'CNC Machines & Tools',
    'Manufacturing Equipment',
    'Automation & Robotics',
    'Heavy Machinery',
    'Machine Tools',
    'Welding Equipment',
    'Packaging Machinery',

    // Construction & Building
    'Construction Materials',
    'Steel & Metal Products',
    'Cement & Concrete',
    'Building Hardware',
    'Electrical Equipment',
    'Plumbing & Pipes',
    'Roofing Materials',
    'Flooring & Tiles',

    // Textiles & Apparel
    'Textiles & Fabrics',
    'Garments & Clothing',
    'Footwear & Leather',
    'Home Textiles',
    'Technical Textiles',
    'Fashion Accessories',
    'Yarn & Fibers',
    'Dyeing & Finishing',

    // Automotive & Transportation
    'Automotive Parts',
    'Commercial Vehicles',
    'Two-Wheelers',
    'Tires & Rubber',
    'Auto Electronics',
    'Lubricants & Oils',
    'Auto Components',
    'Transportation Services',

    // Chemicals & Materials
    'Industrial Chemicals',
    'Plastics & Polymers',
    'Paints & Coatings',
    'Adhesives & Sealants',
    'Specialty Chemicals',
    'Petrochemicals',
    'Fertilizers & Agrochemicals',
    'Pharmaceutical Ingredients',

    // Agriculture & Food
    'Agricultural Products',
    'Food Processing',
    'Dairy & Beverages',
    'Grain & Cereals',
    'Fruits & Vegetables',
    'Meat & Poultry',
    'Seafood & Fish',
    'Organic Products',

    // Healthcare & Medical
    'Medical Devices',
    'Pharmaceuticals',
    'Healthcare Equipment',
    'Diagnostic Tools',
    'Surgical Instruments',
    'Medical Supplies',
    'Dental Equipment',
    'Laboratory Equipment',

    // Energy & Utilities
    'Renewable Energy',
    'Solar & Wind Power',
    'Electrical Equipment',
    'Power Generation',
    'Energy Storage',
    'Oil & Gas Equipment',
    'Nuclear Energy',
    'Energy Services',
  ];

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleNext = () => {
    if (step === 1 && marketplaceRole) {
      setStep(2);
    } else if (step === 2 && selectedCategories.length > 0) {
      setStep(3);
    } else if (step === 3) {
      handleRegistration();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const validateGSTIN = (gstin: string) => {
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    setError('');

    // Validation
    if (!formData.email || !formData.password || !formData.companyName) {
      setError('Please fill in all required fields');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.gstin && !validateGSTIN(formData.gstin)) {
      setError('Please enter a valid GSTIN');
      setIsLoading(false);
      return;
    }

    if (formData.pan && !validatePAN(formData.pan)) {
      setError('Please enter a valid PAN number');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          gstin: formData.gstin,
          pan: formData.pan,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          businessType: formData.businessType,
          annualTurnover: formData.annualTurnover,
          role: marketplaceRole,
          categories: selectedCategories
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(4); // Success step
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12'>
      <div className='container mx-auto px-4'>
        {/* HEADER */}
        <div className='text-center mb-8'>
          <Link
            href='/'
            className='inline-flex items-center text-blue-600 hover:text-blue-700 mb-4'
          >
            <span className='mr-2'>←</span>
            Back to Home
          </Link>
          <h1 className='text-4xl font-bold text-gray-900 mb-2'>BELL24H</h1>
          <h2 className='text-2xl font-bold text-gray-800 mb-4'>Join BELL24H Marketplace</h2>
          <p className='text-gray-600'>
            One account for buying AND selling • Connect with 534,672+ businesses
          </p>
        </div>

        {/* PROGRESS BAR */}
        <div className='max-w-md mx-auto mb-8'>
          <div className='flex justify-between items-center mb-2'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              1
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              2
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              3
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 4 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 4 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              4
            </div>
          </div>
          <p className='text-center text-sm text-gray-600'>
            {step === 1 && 'Marketplace Role'}
            {step === 2 && 'Interested Categories'}
            {step === 3 && 'Business Information'}
            {step === 4 && 'Registration Complete'}
          </p>
        </div>

        {/* STEP 1: MARKETPLACE ROLE */}
        {step === 1 && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white rounded-2xl shadow-xl p-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                What do you plan to do on BELL24H? *
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    marketplaceRole === 'buying'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setMarketplaceRole('buying')}
                >
                  <span className='text-3xl mb-4 block'>🛒</span>
                  <h4 className='font-semibold text-gray-900 mb-2'>Primarily Buying</h4>
                  <p className='text-gray-600 text-sm'>Source products & services</p>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    marketplaceRole === 'selling'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => setMarketplaceRole('selling')}
                >
                  <span className='text-3xl mb-4 block'>🏢</span>
                  <h4 className='font-semibold text-gray-900 mb-2'>Primarily Selling</h4>
                  <p className='text-gray-600 text-sm'>Offer products & services</p>
                </div>

                <div
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    marketplaceRole === 'both'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => setMarketplaceRole('both')}
                >
                  <span className='text-3xl mb-4 block'>🔄</span>
                  <h4 className='font-semibold text-gray-900 mb-2'>Both Buying & Selling</h4>
                  <p className='text-gray-600 text-sm'>Full marketplace access</p>
                </div>
              </div>

              <div className='mt-8 flex justify-end'>
                <button
                  onClick={handleNext}
                  disabled={!marketplaceRole}
                  className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: INTERESTED CATEGORIES */}
        {step === 2 && (
          <div className='max-w-6xl mx-auto'>
            <div className='bg-white rounded-2xl shadow-xl p-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>
                Interested Categories (Select all that apply)
              </h3>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
                {categories.map(category => (
                  <label
                    key={category}
                    className='flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer'
                  >
                    <input
                      type='checkbox'
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryToggle(category)}
                      className='mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                    />
                    <span className='text-sm text-gray-700'>{category}</span>
                  </label>
                ))}
              </div>

              <div className='bg-blue-50 rounded-xl p-6 mb-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center'>
                    <span className='text-2xl mr-3'>✅</span>
                    <h4 className='text-lg font-bold text-blue-900'>Complete Marketplace Access</h4>
                  </div>
                  <div className='text-2xl'>✨</div>
                </div>
                <p className='text-blue-800 mb-4'>With your BELL24H account, you can instantly:</p>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <div className='flex items-center mb-3'>
                      <span className='text-lg mr-2'>🛒</span>
                      <h5 className='font-semibold text-blue-900'>As a Buyer</h5>
                    </div>
                    <ul className='text-sm text-blue-800 space-y-1'>
                      <li>• Post RFQs and source from 534,672+ suppliers</li>
                      <li>• Use AI-powered supplier matching</li>
                      <li>• Access ECGC protection for purchases</li>
                    </ul>
                  </div>

                  <div>
                    <div className='flex items-center mb-3'>
                      <span className='text-lg mr-2'>🏢</span>
                      <h5 className='font-semibold text-blue-900'>As a Seller</h5>
                    </div>
                    <ul className='text-sm text-blue-800 space-y-1'>
                      <li>• List products and respond to RFQs</li>
                      <li>• Build your business profile</li>
                      <li>• Connect with verified buyers</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='flex justify-between'>
                <button
                  onClick={handleBack}
                  className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={selectedCategories.length === 0}
                  className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUSINESS INFORMATION */}
        {step === 3 && (
          <div className='max-w-4xl mx-auto'>
            <div className='bg-white rounded-2xl shadow-xl p-8'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Business Information</h3>
              
              {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
                  {error}
                </div>
              )}

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Account Information */}
                <div className='space-y-4'>
                  <h4 className='font-semibold text-gray-900 mb-4'>Account Information</h4>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address *</label>
                    <input
                      type='email'
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='business@company.com'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Password *</label>
                    <input
                      type='password'
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Create a strong password'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Confirm Password *</label>
                    <input
                      type='password'
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Confirm your password'
                      required
                    />
                  </div>
                </div>

                {/* Business Information */}
                <div className='space-y-4'>
                  <h4 className='font-semibold text-gray-900 mb-4'>Business Information</h4>
                  
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Company Name *</label>
                    <input
                      type='text'
                      value={formData.companyName}
                      onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Your company name'
                      required
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>GSTIN</label>
                    <input
                      type='text'
                      value={formData.gstin}
                      onChange={e => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='22AAAAA0000A1Z5'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>PAN Number</label>
                    <input
                      type='text'
                      value={formData.pan}
                      onChange={e => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='ABCDE1234F'
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className='mt-6'>
                <h4 className='font-semibold text-gray-900 mb-4'>Contact Information</h4>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                    <input
                      type='tel'
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='+91 98765 43210'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Business Type</label>
                    <select
                      value={formData.businessType}
                      onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    >
                      <option value=''>Select Business Type</option>
                      <option value='proprietorship'>Proprietorship</option>
                      <option value='partnership'>Partnership</option>
                      <option value='private-limited'>Private Limited</option>
                      <option value='public-limited'>Public Limited</option>
                      <option value='llp'>LLP</option>
                      <option value='other'>Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className='mt-6'>
                <h4 className='font-semibold text-gray-900 mb-4'>Address Information</h4>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>Address</label>
                    <textarea
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      placeholder='Complete business address'
                      rows={3}
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>City</label>
                      <input
                        type='text'
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='City'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>State</label>
                      <input
                        type='text'
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='State'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>Pincode</label>
                      <input
                        type='text'
                        value={formData.pincode}
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Pincode'
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className='mt-8 flex justify-between'>
                <button
                  onClick={handleBack}
                  className='px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                >
                  Back
                </button>
                <button
                  onClick={handleRegistration}
                  disabled={isLoading}
                  className='px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50'
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REGISTRATION COMPLETE */}
        {step === 4 && (
          <div className='max-w-2xl mx-auto'>
            <div className='bg-white rounded-2xl shadow-xl p-8 text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                <span className='text-3xl'>✅</span>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>Welcome to BELL24H!</h3>
              <p className='text-gray-600 mb-6'>
                Your account has been created successfully. Please check your email for verification.
              </p>
              <div className='bg-blue-50 rounded-xl p-6 mb-6'>
                <h4 className='font-semibold text-blue-900 mb-2'>Next Steps:</h4>
                <ul className='text-sm text-blue-800 space-y-1 text-left'>
                  <li>• Check your email for verification link</li>
                  <li>• Complete your business profile</li>
                  <li>• Start exploring suppliers and buyers</li>
                  <li>• Post your first RFQ or listing</li>
                </ul>
              </div>
              <Link
                href='/auth/login'
                className='inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700'
              >
                Sign In to Your Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Sample data for procurement challenges
 */

export const challengeData = {
  challenges: [
    {
      id: 'supplier-selection-101',
      title: 'Supplier Selection Fundamentals',
      description: 'Learn the basics of effective supplier selection through a series of realistic scenarios.',
      category: 'supplier-selection',
      difficulty: 'beginner',
      status: 'available',
      totalPoints: 1000,
      estimatedTime: 15,
      skills: ['Supplier Evaluation', 'Requirement Analysis', 'Decision Making'],
      prerequisites: [],
      steps: [
        {
          id: 'step1',
          title: 'Define Requirements',
          description: 'Identify the correct requirements for procuring office supplies',
          interactionType: 'multiple-choice',
          content: {
            question: 'Which of the following should be included in your requirements for office supplies?',
            options: [
              { id: 'a', text: 'Delivery timeframe, quantity, and quality specifications' },
              { id: 'b', text: 'Only price and brand name' },
              { id: 'c', text: "Supplier's annual revenue and number of employees" },
              { id: 'd', text: 'Marketing materials and promotional offers' }
            ]
          },
          successCriteria: { correctAnswer: 'a' },
          hint: 'Think about what information you need to make an informed purchasing decision.',
          timeLimit: 60,
          points: 200
        },
        {
          id: 'step2',
          title: 'Compare Proposals',
          description: 'Analyze supplier proposals and identify the best candidate',
          interactionType: 'ranking',
          content: {
            question: 'Rank these suppliers from best to worst based on their proposals:',
            options: [
              { 
                id: 'supplier1', 
                name: 'Office Solutions Inc.', 
                details: 'Price: $5,500, Delivery: 3 days, Quality: Standard, Payment terms: Net 30'
              },
              { 
                id: 'supplier2', 
                name: 'Premium Office Supplies', 
                details: 'Price: $7,200, Delivery: 1 day, Quality: Premium, Payment terms: Net 15'
              },
              { 
                id: 'supplier3', 
                name: 'Budget Office', 
                details: 'Price: $4,800, Delivery: 7 days, Quality: Economy, Payment terms: Net 60'
              },
              { 
                id: 'supplier4', 
                name: 'Office Depot Pro', 
                details: 'Price: $6,100, Delivery: 2 days, Quality: High, Payment terms: Net 30'
              }
            ]
          },
          successCriteria: { idealRanking: ['supplier4', 'supplier1', 'supplier2', 'supplier3'] },
          hint: 'Consider the balance between price, delivery time, quality, and payment terms.',
          timeLimit: 120,
          points: 300
        },
        {
          id: 'step3',
          title: 'Evaluate Risk',
          description: 'Identify potential risks with the selected supplier',
          interactionType: 'multiple-choice',
          content: {
            question: 'Which of these is the biggest risk when working with Office Depot Pro?',
            options: [
              { id: 'a', text: 'Higher than average price' },
              { id: 'b', text: 'Lack of industry experience' },
              { id: 'c', text: 'Limited product variety' },
              { id: 'd', text: 'Single point of contact for support' }
            ]
          },
          successCriteria: { correctAnswer: 'a' },
          hint: 'Look at the supplier details and consider what might impact your budget or operations.',
          timeLimit: 60,
          points: 250
        },
        {
          id: 'step4',
          title: 'Negotiate Terms',
          description: 'Select the best negotiation approach',
          interactionType: 'decision',
          content: {
            scenario: 'Office Depot Pro has offered their services, but you want to negotiate better terms. How do you approach this?',
            options: [
              { 
                id: 'a', 
                text: "Demand a 20% price reduction or you'll go elsewhere", 
                outcome: 'The supplier is unwilling to make such a large price cut and negotiations break down.'
              },
              { 
                id: 'b', 
                text: 'Accept their offer as-is to maintain good relations', 
                outcome: 'You secure the supplies but miss an opportunity to optimize terms.'
              },
              { 
                id: 'c', 
                text: 'Request a 5% discount in exchange for faster payment terms', 
                outcome: 'The supplier agrees to a 4% discount for payment within 15 days.'
              },
              { 
                id: 'd', 
                text: 'Ask for free expedited shipping on all orders', 
                outcome: 'The supplier agrees to free expedited shipping on orders over $1,000.'
              }
            ]
          },
          successCriteria: { bestChoices: ['c', 'd'] },
          hint: 'Consider what creates a win-win situation where both parties benefit.',
          timeLimit: 90,
          points: 250
        }
      ]
    },
    {
      id: 'contract-negotiation-basics',
      title: 'Contract Negotiation Essentials',
      description: 'Master the fundamentals of effective contract negotiation',
      category: 'contract-management',
      difficulty: 'intermediate',
      status: 'locked',
      totalPoints: 1500,
      estimatedTime: 20,
      skills: ['Contract Terms', 'Negotiation', 'Legal Awareness'],
      prerequisites: ['supplier-selection-101'],
      steps: [
        {
          id: 'step1',
          title: 'Contract Element Identification',
          description: 'Identify essential elements of a procurement contract',
          interactionType: 'multiple-choice',
          content: {
            question: 'Which of these is NOT typically included in a procurement contract?',
            options: [
              { id: 'a', text: 'Payment terms and conditions' },
              { id: 'b', text: 'Delivery schedule and requirements' },
              { id: 'c', text: "Supplier's internal hiring policies" },
              { id: 'd', text: 'Termination clauses' }
            ]
          },
          successCriteria: { correctAnswer: 'c' },
          hint: 'Focus on elements that directly impact the business relationship between buyer and supplier.',
          timeLimit: 60,
          points: 300
        },
        {
          id: 'step2',
          title: 'Contract Term Matching',
          description: 'Match contract terms with their correct definitions',
          interactionType: 'matching',
          content: {
            question: 'Match each contract term with its correct definition:',
            items: {
              'Force Majeure': 'Unforeseeable circumstances that prevent someone from fulfilling a contract',
              'Indemnification': 'Protection against legal liability for another's actions',
              'Liquidated Damages': 'Predetermined damages for breach of contract',
              'Warranty': 'Assurance that a product or service will meet certain standards'
            }
          },
          successCriteria: { 
            correctPairs: {
              'Force Majeure': 'Unforeseeable circumstances that prevent someone from fulfilling a contract',
              'Indemnification': 'Protection against legal liability for another\'s actions',
              'Liquidated Damages': 'Predetermined damages for breach of contract',
              'Warranty': 'Assurance that a product or service will meet certain standards'
            } 
          },
          hint: 'Think about the purpose and context of each legal term.',
          timeLimit: 120,
          points: 400
        },
        {
          id: 'step3',
          title: 'Negotiation Strategy',
          description: 'Choose the best negotiation strategy for a given scenario',
          interactionType: 'decision',
          content: {
            scenario: 'A key supplier is asking for a 15% price increase due to rising raw material costs. Your company relies heavily on this supplier. How do you negotiate?',
            options: [
              { 
                id: 'a', 
                text: 'Accept the full 15% increase to maintain the relationship',
                outcome: 'You maintain good relations but significantly impact your budget.'
              },
              { 
                id: 'b', 
                text: 'Reject the increase entirely and threaten to find a new supplier',
                outcome: 'The supplier refuses to continue at the current price, creating supply chain disruption.'
              },
              { 
                id: 'c', 
                text: 'Counter with a 5% increase, explaining your budget constraints',
                outcome: 'After discussion, you agree to a 8% increase, phased in over 6 months.'
              },
              { 
                id: 'd', 
                text: 'Request to see cost documentation and suggest a price adjustment formula based on actual material costs',
                outcome: 'The supplier agrees to an 11% increase with quarterly reviews based on material price indices.'
              }
            ]
          },
          successCriteria: { bestChoices: ['c', 'd'] },
          hint: 'Consider both the short-term financial impact and the long-term supplier relationship.',
          timeLimit: 90,
          points: 350
        },
        {
          id: 'step4',
          title: 'Contract Risk Assessment',
          description: 'Identify and prioritize contract risks',
          interactionType: 'ranking',
          content: {
            question: 'Rank these contract issues from highest to lowest risk:',
            options: [
              { 
                id: 'risk1', 
                name: 'No cap on liability', 
                details: 'The contract does not limit your potential liability for damages.'
              },
              { 
                id: 'risk2', 
                name: 'Vague delivery terms', 
                details: 'Delivery is specified as "as soon as possible" with no specific timeframe.'
              },
              { 
                id: 'risk3', 
                name: 'No termination clause', 
                details: 'The contract does not specify how either party can terminate the agreement.'
              },
              { 
                id: 'risk4', 
                name: 'Payment due upon receipt', 
                details: 'Payment is required immediately upon delivery instead of standard net-30 terms.'
              }
            ]
          },
          successCriteria: { idealRanking: ['risk1', 'risk3', 'risk2', 'risk4'] },
          hint: 'Consider the potential financial and operational impact of each issue.',
          timeLimit: 120,
          points: 450
        }
      ]
    },
    {
      id: 'risk-assessment-fundamentals',
      title: 'Risk Assessment Fundamentals',
      description: 'Learn how to identify, analyze, and mitigate procurement risks',
      category: 'risk-assessment',
      difficulty: 'intermediate',
      status: 'locked',
      totalPoints: 1200,
      estimatedTime: 25,
      skills: ['Risk Analysis', 'Mitigation Strategies', 'Contingency Planning'],
      prerequisites: ['supplier-selection-101'],
      steps: [
        {
          id: 'step1',
          title: 'Risk Identification',
          description: 'Identify common procurement risks',
          interactionType: 'multiple-choice',
          content: {
            question: 'Which of the following is NOT typically considered a procurement risk?',
            options: [
              { id: 'a', text: 'Supplier bankruptcy' },
              { id: 'b', text: 'Price fluctuations' },
              { id: 'c', text: 'Favorable currency exchange rates' },
              { id: 'd', text: 'Delivery delays' }
            ]
          },
          successCriteria: { correctAnswer: 'c' },
          hint: 'Risk generally refers to potential negative events or conditions.',
          timeLimit: 60,
          points: 250
        },
        {
          id: 'step2',
          title: 'Risk Analysis',
          description: 'Analyze procurement risks based on impact and probability',
          interactionType: 'matching',
          content: {
            question: 'Match each risk with its appropriate category on a risk matrix:',
            items: {
              'Major supplier going bankrupt': 'High impact, low probability',
              'Small delivery delay': 'Low impact, high probability',
              'Natural disaster affecting main facility': 'High impact, low probability',
              'Minor quality issues': 'Low impact, high probability'
            }
          },
          successCriteria: { 
            correctPairs: {
              'Major supplier going bankrupt': 'High impact, low probability',
              'Small delivery delay': 'Low impact, high probability',
              'Natural disaster affecting main facility': 'High impact, low probability',
              'Minor quality issues': 'Low impact, high probability'
            } 
          },
          hint: 'Consider both how likely each event is and how severely it would affect operations.',
          timeLimit: 120,
          points: 300
        },
        {
          id: 'step3',
          title: 'Risk Mitigation Strategies',
          description: 'Select appropriate strategies to mitigate procurement risks',
          interactionType: 'decision',
          content: {
            scenario: 'Your company relies on a single supplier for a critical component. How do you mitigate the supply risk?',
            options: [
              { 
                id: 'a', 
                text: 'Accept the risk and focus resources elsewhere',
                outcome: 'No risk mitigation is implemented, leaving your company vulnerable to supply disruptions.'
              },
              { 
                id: 'b', 
                text: 'Identify and qualify backup suppliers',
                outcome: 'You establish relationships with two alternative suppliers who can provide the component if needed.'
              },
              { 
                id: 'c', 
                text: 'Increase inventory levels of the critical component',
                outcome: 'You maintain a 3-month supply buffer, increasing holding costs but reducing short-term disruption risk.'
              },
              { 
                id: 'd', 
                text: 'Implement a dual-sourcing strategy with the current and a new supplier',
                outcome: 'You split orders 70/30 between suppliers, slightly increasing costs but significantly reducing supply risk.'
              }
            ]
          },
          successCriteria: { bestChoices: ['b', 'd'] },
          hint: 'Consider strategies that balance risk reduction with operational and cost impacts.',
          timeLimit: 90,
          points: 350
        },
        {
          id: 'step4',
          title: 'Budget Risk Simulation',
          description: 'Allocate budget reserves to different risk categories',
          interactionType: 'simulation',
          content: {
            simulationType: 'budget-allocation',
            scenario: 'You have a $100,000 procurement budget with a $10,000 risk reserve. Allocate the risk reserve across these categories based on risk levels:',
            categories: [
              { id: 'price', name: 'Price Volatility', description: 'Risk of price increases during contract period' },
              { id: 'quality', name: 'Quality Issues', description: 'Risk of receiving substandard goods requiring replacement' },
              { id: 'delivery', name: 'Delivery Delays', description: 'Risk of late deliveries impacting operations' },
              { id: 'compliance', name: 'Compliance Issues', description: 'Risk of regulatory non-compliance penalties' }
            ]
          },
          successCriteria: { 
            optimalAllocation: {
              'price': 35,
              'quality': 25,
              'delivery': 30,
              'compliance': 10
            }
          },
          hint: 'Allocate more budget to higher risk areas while ensuring all risks have some coverage.',
          timeLimit: 180,
          points: 400
        }
      ]
    },
    {
      id: 'sustainable-procurement',
      title: 'Sustainable Procurement Practices',
      description: 'Learn how to integrate sustainability into procurement decisions',
      category: 'sustainability',
      difficulty: 'advanced',
      status: 'locked',
      totalPoints: 1800,
      estimatedTime: 30,
      skills: ['Sustainability Assessment', 'Green Procurement', 'Social Responsibility'],
      prerequisites: ['supplier-selection-101', 'risk-assessment-fundamentals'],
      steps: [
        {
          id: 'step1',
          title: 'Sustainability Criteria',
          description: 'Identify appropriate sustainability criteria for supplier evaluation',
          interactionType: 'multiple-choice',
          content: {
            question: 'Which of these is NOT typically considered a sustainability criterion in procurement?',
            options: [
              { id: 'a', text: 'Carbon footprint and emissions' },
              { id: 'b', text: 'Labor practices and human rights' },
              { id: 'c', text: 'Profit margin percentages' },
              { id: 'd', text: 'Waste management practices' }
            ]
          },
          successCriteria: { correctAnswer: 'c' },
          hint: 'Sustainability encompasses environmental, social, and governance factors, not just financial performance.',
          timeLimit: 60,
          points: 300
        },
        {
          id: 'step2',
          title: 'Sustainability Certification Matching',
          description: 'Match sustainability certifications with their focus areas',
          interactionType: 'matching',
          content: {
            question: 'Match each sustainability certification with its primary focus area:',
            items: {
              'ISO 14001': 'Environmental management systems',
              'SA8000': 'Labor conditions and worker rights',
              'FSC (Forest Stewardship Council)': 'Responsible forest management',
              'ENERGY STAR': 'Energy efficiency standards'
            }
          },
          successCriteria: { 
            correctPairs: {
              'ISO 14001': 'Environmental management systems',
              'SA8000': 'Labor conditions and worker rights',
              'FSC (Forest Stewardship Council)': 'Responsible forest management',
              'ENERGY STAR': 'Energy efficiency standards'
            } 
          },
          hint: 'Each certification focuses on specific aspects of sustainability.',
          timeLimit: 120,
          points: 400
        },
        {
          id: 'step3',
          title: 'Sustainable Supplier Selection',
          description: 'Select the most sustainable supplier option',
          interactionType: 'decision',
          content: {
            scenario: 'You need to select a supplier for office furniture. Which option would you choose based on sustainability criteria?',
            options: [
              { 
                id: 'a', 
                text: 'Lowest cost supplier with standard materials and overseas manufacturing',
                outcome: 'You save 15% on costs but the furniture has a high carbon footprint and unknown labor practices.'
              },
              { 
                id: 'b', 
                text: 'Mid-priced supplier with FSC-certified wood and local manufacturing',
                outcome: 'You pay a 10% premium but get furniture made with sustainable materials and support local jobs.'
              },
              { 
                id: 'c', 
                text: 'Premium supplier with reclaimed materials and carbon-neutral operations',
                outcome: 'You pay a 25% premium for furniture with minimal environmental impact and excellent social practices.'
              },
              { 
                id: 'd', 
                text: 'Supplier offering refurbished furniture at discount prices',
                outcome: 'You save 20% and extend the lifecycle of existing furniture, reducing waste.'
              }
            ]
          },
          successCriteria: { bestChoices: ['b', 'd'] },
          hint: 'Consider the balance between environmental impact, social factors, and cost constraints.',
          timeLimit: 90,
          points: 500
        },
        {
          id: 'step4',
          title: 'Sustainability Impact Assessment',
          description: 'Assess the sustainability impact of procurement decisions',
          interactionType: 'ranking',
          content: {
            question: 'Rank these procurement decisions from highest to lowest positive sustainability impact:',
            options: [
              { 
                id: 'option1', 
                name: 'Implementing a supplier code of conduct', 
                details: 'Requiring all suppliers to meet minimum environmental and social standards'
              },
              { 
                id: 'option2', 
                name: 'Switching to digital procurement processes', 
                details: 'Eliminating paper-based purchasing and invoicing'
              },
              { 
                id: 'option3', 
                name: 'Reducing packaging requirements', 
                details: 'Working with suppliers to minimize unnecessary packaging'
              },
              { 
                id: 'option4', 
                name: 'Conducting lifecycle assessments', 
                details: 'Analyzing the total environmental impact of products from production to disposal'
              }
            ]
          },
          successCriteria: { idealRanking: ['option4', 'option1', 'option3', 'option2'] },
          hint: 'Consider the potential scale and scope of impact for each decision.',
          timeLimit: 120,
          points: 600
        }
      ]
    },
    {
      id: 'negotiation-mastery',
      title: 'Advanced Negotiation Tactics',
      description: 'Master sophisticated negotiation strategies for high-value procurement deals',
      category: 'price-negotiation',
      difficulty: 'expert',
      status: 'locked',
      totalPoints: 2000,
      estimatedTime: 40,
      skills: ['Advanced Negotiation', 'Value Analysis', 'Strategic Partnerships'],
      prerequisites: ['contract-negotiation-basics'],
      steps: [
        {
          id: 'step1',
          title: 'Negotiation Style Assessment',
          description: 'Identify the appropriate negotiation style for different situations',
          interactionType: 'matching',
          content: {
            question: 'Match each procurement scenario with the most appropriate negotiation style:',
            items: {
              'One-time purchase of standard commodities': 'Competitive (focus on price)',
              'Strategic partnership with key technology provider': 'Collaborative (focus on mutual value)',
              'Contract renewal with existing supplier during market volatility': 'Adaptable (balance relationship and market position)',
              'Emergency procurement during supply chain disruption': 'Accommodating (focus on securing supply)'
            }
          },
          successCriteria: { 
            correctPairs: {
              'One-time purchase of standard commodities': 'Competitive (focus on price)',
              'Strategic partnership with key technology provider': 'Collaborative (focus on mutual value)',
              'Contract renewal with existing supplier during market volatility': 'Adaptable (balance relationship and market position)',
              'Emergency procurement during supply chain disruption': 'Accommodating (focus on securing supply)'
            } 
          },
          hint: 'The appropriate negotiation style depends on the strategic importance, market conditions, and relationship factors.',
          timeLimit: 120,
          points: 400
        },
        {
          id: 'step2',
          title: 'Total Cost of Ownership Analysis',
          description: 'Calculate and compare the total cost of ownership for procurement options',
          interactionType: 'decision',
          content: {
            scenario: 'You need to select a vendor for enterprise software. Based on the total cost of ownership analysis, which option would you recommend?',
            options: [
              { 
                id: 'a', 
                text: 'Vendor A: Purchase price $250,000, annual maintenance $50,000, implementation $100,000, training $30,000, 5-year lifecycle',
                outcome: 'Total 5-year cost: $630,000. High initial cost but predictable expenses.'
              },
              { 
                id: 'b', 
                text: 'Vendor B: Purchase price $150,000, annual maintenance $70,000, implementation $150,000, training $40,000, 5-year lifecycle',
                outcome: 'Total 5-year cost: $690,000. Lower initial cost but higher ongoing expenses.'
              },
              { 
                id: 'c', 
                text: 'Vendor C: Subscription model at $120,000 per year, implementation $80,000, training $40,000, 5-year lifecycle',
                outcome: 'Total 5-year cost: $720,000. No capital expenditure but highest total cost.'
              },
              { 
                id: 'd', 
                text: 'Vendor D: Purchase price $200,000, annual maintenance $40,000, implementation $150,000, training $50,000, upgrade in year 3 at $100,000',
                outcome: 'Total 5-year cost: $600,000. Cost spike in year 3 but lowest total cost.'
              }
            ]
          },
          successCriteria: { bestChoices: ['a', 'd'] },
          hint: 'Consider both the total cost over the entire lifecycle and the timing of expenditures.',
          timeLimit: 180,
          points: 500
        },
        {
          id: 'step3',
          title: 'Negotiation Leverage Analysis',
          description: 'Identify and evaluate negotiation leverage factors',
          interactionType: 'ranking',
          content: {
            question: 'Rank these leverage factors from strongest to weakest in a negotiation with a sole-source supplier:',
            options: [
              { 
                id: 'leverage1', 
                name: 'Future business opportunities', 
                details: 'Potential for expanded business in upcoming product lines'
              },
              { 
                id: 'leverage2', 
                name: 'Threat of vertical integration', 
                details: 'Your company considering manufacturing the component in-house'
              },
              { 
                id: 'leverage3', 
                name: 'Payment terms flexibility', 
                details: 'Ability to offer faster payment than standard terms'
              },
              { 
                id: 'leverage4', 
                name: 'Industry reputation', 
                details: 'Your company's influence in the industry and with other suppliers'
              }
            ]
          },
          successCriteria: { idealRanking: ['leverage2', 'leverage1', 'leverage4', 'leverage3'] },
          hint: 'Consider which factors present the most significant value or threat to the supplier.',
          timeLimit: 120,
          points: 500
        },
        {
          id: 'step4',
          title: 'Complex Negotiation Simulation',
          description: 'Navigate a multi-variable negotiation scenario',
          interactionType: 'simulation',
          content: {
            simulationType: 'multi-variable-negotiation',
            scenario: 'You are negotiating a 3-year contract for critical components. Balance these variables to achieve the optimal outcome:',
            variables: [
              { id: 'price', name: 'Unit Price', target: 'Minimize', constraint: 'Between $100-130 per unit' },
              { id: 'volume', name: 'Minimum Volume Commitment', target: 'Minimize', constraint: 'Between 10,000-20,000 units per year' },
              { id: 'payment', name: 'Payment Terms', target: 'Maximize', constraint: 'Between Net 30-60' },
              { id: 'delivery', name: 'Delivery Lead Time', target: 'Minimize', constraint: 'Between 2-6 weeks' },
              { id: 'quality', name: 'Quality Requirements', target: 'Maximize', constraint: 'Between 98-99.9% defect-free' }
            ]
          },
          successCriteria: { 
            optimalValues: {
              'price': 115,
              'volume': 15000,
              'payment': 45,
              'delivery': 3,
              'quality': 99.5
            }
          },
          hint: 'Consider the trade-offs between variables and look for the balanced solution that optimizes overall value.',
          timeLimit: 300,
          points: 600
        }
      ]
    }
  ]
};
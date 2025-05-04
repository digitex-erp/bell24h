import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from typing import List, Dict, Any, Optional
import random
import json
from datetime import datetime, timedelta

# Create FastAPI app
app = FastAPI(
    title="Bell24h RFQ Matching Demo",
    description="Demo for the AI-powered RFQ supplier matching system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, this should be restricted
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data for demonstration
CATEGORIES = [
    "Electronics Manufacturing", 
    "Industrial Equipment", 
    "Mechanical Parts", 
    "Plastic Goods",
    "Textile Production", 
    "Chemical Processing", 
    "Food Processing", 
    "Metal Fabrication"
]

STATES = [
    "Maharashtra", "Gujarat", "Tamil Nadu", "Karnataka", 
    "Uttar Pradesh", "Delhi", "Haryana", "Punjab"
]

# Sample supplier data
SUPPLIERS = [
    {
        "id": "sup-001",
        "name": "Rahul Patel",
        "company_name": "TechCraft Industries",
        "email": "rahul@techcraft.in",
        "gstin": "27AABCT3518Q1ZX",
        "is_gst_verified": True,
        "city": "Mumbai",
        "state": "Maharashtra",
        "specializations": ["Electronics Manufacturing", "Metal Fabrication"],
        "completion_rate": 0.92,
        "avg_delivery_days": 12.5,
        "rating": 4.7,
        "total_completed": 48,
        "price_competitiveness": "medium"
    },
    {
        "id": "sup-002",
        "name": "Priya Sharma",
        "company_name": "Innovative Solutions Ltd",
        "email": "priya@innovative.in",
        "gstin": "29AAACI1234Z1ZV",
        "is_gst_verified": True,
        "city": "Bangalore",
        "state": "Karnataka",
        "specializations": ["Electronics Manufacturing", "Industrial Equipment"],
        "completion_rate": 0.95,
        "avg_delivery_days": 10.2,
        "rating": 4.8,
        "total_completed": 73,
        "price_competitiveness": "high"
    },
    {
        "id": "sup-003",
        "name": "Vikram Singh",
        "company_name": "Punjab Metalworks",
        "email": "vikram@punjabmetal.in",
        "gstin": "03AABCP3827C1ZU",
        "is_gst_verified": True,
        "city": "Ludhiana",
        "state": "Punjab",
        "specializations": ["Metal Fabrication", "Industrial Equipment"],
        "completion_rate": 0.88,
        "avg_delivery_days": 15.5,
        "rating": 4.5,
        "total_completed": 62,
        "price_competitiveness": "medium"
    },
    {
        "id": "sup-004",
        "name": "Aisha Khan",
        "company_name": "Textile Innovators",
        "email": "aisha@textileinnovators.in",
        "gstin": "07AADCT6574G1ZQ",
        "is_gst_verified": True,
        "city": "Delhi",
        "state": "Delhi",
        "specializations": ["Textile Production"],
        "completion_rate": 0.97,
        "avg_delivery_days": 8.3,
        "rating": 4.9,
        "total_completed": 87,
        "price_competitiveness": "medium"
    },
    {
        "id": "sup-005",
        "name": "Rajesh Kumar",
        "company_name": "Chemical Solutions",
        "email": "rajesh@chemsol.in",
        "gstin": "24AABCC4563D1ZT",
        "is_gst_verified": True,
        "city": "Ahmedabad",
        "state": "Gujarat",
        "specializations": ["Chemical Processing", "Industrial Equipment"],
        "completion_rate": 0.91,
        "avg_delivery_days": 14.2,
        "rating": 4.6,
        "total_completed": 54,
        "price_competitiveness": "low"
    },
    {
        "id": "sup-006",
        "name": "Sanjay Verma",
        "company_name": "Precision Components",
        "email": "sanjay@precisioncomp.in",
        "gstin": "27AADCP8742E1ZR",
        "is_gst_verified": True,
        "city": "Pune",
        "state": "Maharashtra",
        "specializations": ["Mechanical Parts", "Metal Fabrication"],
        "completion_rate": 0.93,
        "avg_delivery_days": 11.8,
        "rating": 4.7,
        "total_completed": 68,
        "price_competitiveness": "high"
    },
    {
        "id": "sup-007",
        "name": "Meera Reddy",
        "company_name": "South India Plastics",
        "email": "meera@siplastics.in",
        "gstin": "33AABCS9541F1ZY",
        "is_gst_verified": False,
        "city": "Chennai",
        "state": "Tamil Nadu",
        "specializations": ["Plastic Goods"],
        "completion_rate": 0.86,
        "avg_delivery_days": 13.5,
        "rating": 4.3,
        "total_completed": 45,
        "price_competitiveness": "medium"
    },
    {
        "id": "sup-008",
        "name": "Anil Agarwal",
        "company_name": "Modern Food Equipment",
        "email": "anil@modernfood.in",
        "gstin": "09AABCM6329G1ZS",
        "is_gst_verified": True,
        "city": "Kanpur",
        "state": "Uttar Pradesh",
        "specializations": ["Food Processing", "Mechanical Parts"],
        "completion_rate": 0.90,
        "avg_delivery_days": 12.2,
        "rating": 4.5,
        "total_completed": 57,
        "price_competitiveness": "medium"
    },
    {
        "id": "sup-009",
        "name": "Kavita Joshi",
        "company_name": "Electronics Experts",
        "email": "kavita@eexperts.in",
        "gstin": "06AABCE2187H1ZT",
        "is_gst_verified": True,
        "city": "Gurugram",
        "state": "Haryana",
        "specializations": ["Electronics Manufacturing"],
        "completion_rate": 0.94,
        "avg_delivery_days": 9.8,
        "rating": 4.8,
        "total_completed": 79,
        "price_competitiveness": "high"
    },
    {
        "id": "sup-010",
        "name": "Harish Mehta",
        "company_name": "Mehta Engineering Works",
        "email": "harish@mehtaeng.in",
        "gstin": "24AAECM1458J1ZW",
        "is_gst_verified": True,
        "city": "Surat",
        "state": "Gujarat",
        "specializations": ["Industrial Equipment", "Metal Fabrication"],
        "completion_rate": 0.89,
        "avg_delivery_days": 14.7,
        "rating": 4.4,
        "total_completed": 51,
        "price_competitiveness": "low"
    }
]

def match_suppliers_for_rfq(rfq: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Match suppliers for a given RFQ using the AI matching engine
    
    This is a simplified demo version that uses pre-defined suppliers
    """
    # Extract RFQ details
    category = rfq.get("category", "")
    delivery_days = int(rfq.get("delivery_days", 15))
    budget = float(rfq.get("budget", 10000))
    
    # Define feature weights
    weights = {
        "category_match": 0.25,  # Category match
        "price_competitiveness": 0.20,  # Price competitiveness
        "completion_rate": 0.15,  # Completion rate
        "delivery_time": 0.20,  # Delivery time match
        "rating": 0.10,  # Rating
        "experience": 0.10   # Experience level
    }
    
    feature_names = [
        "Category Match",
        "Price Competitiveness",
        "Completion Rate",
        "Delivery Time",
        "Supplier Rating",
        "Supplier Experience"
    ]
    
    # Calculate scores for each supplier
    scored_suppliers = []
    
    for supplier in SUPPLIERS:
        # Calculate individual feature scores
        # Category match (0 or 1)
        category_match = 1.0 if category in supplier["specializations"] else 0.0
        
        # Price competitiveness (0.3, 0.6, 0.9)
        price_comp_value = {
            "low": 0.3,
            "medium": 0.6,
            "high": 0.9
        }.get(supplier.get("price_competitiveness", "medium"), 0.6)
        
        # Calculate delivery match score
        # Higher score if supplier delivery days are less than or equal to required
        avg_delivery = supplier.get("avg_delivery_days", 0.0)
        delivery_match = 0.0
        if avg_delivery > 0:
            delivery_ratio = delivery_days / avg_delivery
            delivery_match = min(1.0, max(0.0, delivery_ratio))
        
        # Normalize rating to 0-1 range
        normalized_rating = min(1.0, supplier.get("rating", 0.0) / 5.0)
        
        # Normalize experience to 0-1 range
        normalized_experience = min(1.0, supplier.get("total_completed", 0) / 100.0)
        
        # Calculate overall score using weights
        features = {
            "category_match": category_match,
            "price_competitiveness": price_comp_value,
            "completion_rate": supplier.get("completion_rate", 0.0),
            "delivery_time": delivery_match,
            "rating": normalized_rating,
            "experience": normalized_experience
        }
        
        # Calculate total score
        total_score = sum(value * weights[key] for key, value in features.items())
        
        # Calculate feature contributions (similar to SHAP values)
        mean_features = {
            "category_match": 0.5,  # Assume 50% of suppliers match the category
            "price_competitiveness": 0.6,  # Assume medium price is average
            "completion_rate": 0.9,  # Assume 90% completion rate is average
            "delivery_time": 0.7,  # Assume 70% delivery match is average
            "rating": 0.8,  # Assume 4/5 rating is average
            "experience": 0.5  # Assume 50 completed orders is average
        }
        
        # Calculate the contribution of each feature
        feature_contributions = []
        for i, key in enumerate(["category_match", "price_competitiveness", "completion_rate", 
                                 "delivery_time", "rating", "experience"]):
            # Calculate contribution as (feature - mean) * weight
            contribution = (features[key] - mean_features[key]) * weights[key]
            
            # Create explanation text based on feature
            expl_text = ""
            if key == "category_match":
                if contribution > 0:
                    expl_text = f"Supplier specializes in {category}"
                else:
                    expl_text = f"Supplier doesn't specialize in {category}"
            elif key == "price_competitiveness":
                comp_level = supplier["price_competitiveness"]
                expl_text = f"{comp_level.capitalize()} price competitiveness based on past quotes"
            elif key == "completion_rate":
                rate = supplier["completion_rate"] * 100
                expl_text = f"Supplier completes {rate:.1f}% of accepted RFQs"
            elif key == "delivery_time":
                avg_days = supplier["avg_delivery_days"]
                if avg_days > 0:
                    expl_text = f"Average delivery time is {avg_days:.1f} days vs. {delivery_days} days requested"
                else:
                    expl_text = "No delivery history available"
            elif key == "rating":
                rating = supplier["rating"]
                expl_text = f"Supplier has an average rating of {rating:.1f}/5.0"
            elif key == "experience":
                completed = supplier["total_completed"]
                expl_text = f"Supplier has completed {completed} orders"
            
            feature_contributions.append({
                "name": feature_names[i],
                "value": contribution,
                "explanation": expl_text
            })
        
        # Sort feature contributions by absolute magnitude
        feature_contributions.sort(key=lambda x: abs(x["value"]), reverse=True)
        
        # Add supplier with score and explanations to results
        supplier_result = supplier.copy()
        supplier_result["match_score"] = total_score
        supplier_result["shap_values"] = feature_contributions
        scored_suppliers.append(supplier_result)
    
    # Sort by match score (descending)
    scored_suppliers.sort(key=lambda x: x["match_score"], reverse=True)
    
    # Return top matches
    return scored_suppliers[:5]  # Return top 5 matches

@app.get("/", response_class=HTMLResponse)
async def get_rfq_demo_page():
    """Serve the RFQ matching demo page"""
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bell24h RFQ Matching Demo</title>
        <style>
            :root {
                --primary-color: #2563eb;
                --primary-light: #3b82f6;
                --primary-dark: #1e40af;
                --success-color: #10b981;
                --warning-color: #f59e0b;
                --danger-color: #ef4444;
                --neutral-color: #6b7280;
                --background-color: #f9fafb;
                --card-background: #ffffff;
                --text-color: #1f2937;
                --text-light: #6b7280;
                --border-color: #e5e7eb;
                --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            }

            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: var(--text-color);
                background-color: var(--background-color);
                margin: 0;
                padding: 0;
            }

            .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 1rem;
            }

            header {
                background-color: var(--primary-color);
                color: white;
                padding: 1rem 0;
                box-shadow: var(--shadow);
            }

            header .container {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            header h1 {
                margin: 0;
                font-weight: 600;
            }

            .logo {
                font-weight: bold;
                font-size: 1.5rem;
            }

            main {
                padding: 2rem 0;
            }

            h2 {
                color: var(--primary-dark);
                margin-top: 0;
                border-bottom: 2px solid var(--border-color);
                padding-bottom: 0.5rem;
            }

            .card {
                background-color: var(--card-background);
                border-radius: 0.5rem;
                box-shadow: var(--shadow);
                padding: 1.5rem;
                margin-bottom: 1.5rem;
            }

            .card h3 {
                margin-top: 0;
                color: var(--primary-color);
            }

            .form-group {
                margin-bottom: 1rem;
            }

            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            input, select, textarea {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid var(--border-color);
                border-radius: 0.25rem;
                font-size: 1rem;
                margin-bottom: 0.5rem;
            }

            textarea {
                min-height: 100px;
                resize: vertical;
            }

            button {
                background-color: var(--primary-color);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 0.25rem;
                font-size: 1rem;
                cursor: pointer;
                transition: background-color 0.2s;
            }

            button:hover {
                background-color: var(--primary-dark);
            }

            .button-row {
                display: flex;
                justify-content: flex-end;
                gap: 1rem;
                margin-top: 1rem;
            }

            .grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }

            .supplier-card {
                background-color: var(--card-background);
                border-radius: 0.5rem;
                box-shadow: var(--shadow);
                padding: 1.5rem;
                position: relative;
                border-top: 4px solid var(--primary-color);
                transition: transform 0.2s;
            }

            .supplier-card:hover {
                transform: translateY(-4px);
            }

            .match-score {
                position: absolute;
                top: 1rem;
                right: 1rem;
                background-color: var(--primary-color);
                color: white;
                padding: 0.25rem 0.5rem;
                border-radius: 0.25rem;
                font-weight: bold;
            }

            .supplier-info {
                margin-bottom: 1rem;
            }

            .supplier-info h3 {
                margin: 0;
                color: var(--primary-dark);
            }

            .supplier-info p {
                margin: 0.25rem 0;
                color: var(--text-light);
            }

            .metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .metric {
                background-color: #f3f4f6;
                padding: 0.5rem;
                border-radius: 0.25rem;
            }

            .metric span {
                font-weight: bold;
                color: var(--primary-color);
            }

            .explanation-title {
                margin-bottom: 0.5rem;
                font-weight: 600;
                color: var(--primary-dark);
                border-bottom: 1px solid var(--border-color);
                padding-bottom: 0.5rem;
            }

            .explanations {
                margin-top: 1rem;
            }

            .explanation {
                display: flex;
                margin-bottom: 0.5rem;
                align-items: center;
            }

            .bar-container {
                flex-grow: 1;
                height: 20px;
                background-color: #f3f4f6;
                margin: 0 1rem;
                position: relative;
                overflow: hidden;
                border-radius: 4px;
            }

            .bar {
                height: 100%;
                position: absolute;
                left: 50%;
                top: 0;
            }

            .bar.positive {
                background-color: var(--success-color);
            }

            .bar.negative {
                background-color: var(--danger-color);
                transform: translateX(-100%);
            }

            .explanation-text {
                font-size: 0.85rem;
                color: var(--text-light);
                margin-top: 0.25rem;
            }

            .explanation-value {
                font-weight: 600;
                width: 50px;
                text-align: center;
            }

            .positive-value {
                color: var(--success-color);
            }

            .negative-value {
                color: var(--danger-color);
            }

            .loading {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
            }

            .spinner {
                border: 4px solid rgba(0, 0, 0, 0.1);
                border-radius: 50%;
                border-top: 4px solid var(--primary-color);
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Section divider */
            .section-divider {
                margin: 2rem 0;
                border-top: 1px solid var(--border-color);
                position: relative;
            }

            .section-divider h2 {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: var(--background-color);
                padding: 0 1rem;
                margin: 0;
                border-bottom: none;
            }

            /* Responsive adjustments */
            @media (max-width: 768px) {
                .grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <header>
            <div class="container">
                <div class="logo">Bell24h.com</div>
                <div>AI-Powered RFQ Matching Demo</div>
            </div>
        </header>

        <main class="container">
            <div class="card">
                <h2>Request for Quote (RFQ) Details</h2>
                <p>Enter your RFQ details below to find the best matching suppliers using our AI matching engine.</p>
                
                <form id="rfqForm">
                    <div class="form-group">
                        <label for="title">RFQ Title</label>
                        <input type="text" id="title" name="title" required placeholder="e.g., PCB Manufacturing for IoT Devices">
                    </div>
                    
                    <div class="form-group">
                        <label for="category">Category</label>
                        <select id="category" name="category" required>
                            <option value="">Select a category</option>
                            <!-- Categories will be populated by JavaScript -->
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Description</label>
                        <textarea id="description" name="description" required placeholder="Provide detailed specifications of your requirements..."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="quantity">Quantity</label>
                        <input type="number" id="quantity" name="quantity" required min="1" placeholder="e.g., 100">
                    </div>
                    
                    <div class="form-group">
                        <label for="budget">Budget (₹)</label>
                        <input type="number" id="budget" name="budget" required min="1" placeholder="e.g., 50000">
                    </div>
                    
                    <div class="form-group">
                        <label for="delivery_days">Required Delivery Days</label>
                        <input type="number" id="delivery_days" name="delivery_days" required min="1" placeholder="e.g., 15">
                    </div>
                    
                    <div class="form-group">
                        <label for="state">State</label>
                        <select id="state" name="state" required>
                            <option value="">Select a state</option>
                            <!-- States will be populated by JavaScript -->
                        </select>
                    </div>
                    
                    <div class="button-row">
                        <button type="button" id="resetBtn">Reset</button>
                        <button type="submit">Find Matching Suppliers</button>
                    </div>
                </form>
            </div>
            
            <div class="section-divider">
                <h2>AI Matched Suppliers</h2>
            </div>
            
            <div id="results">
                <p class="text-center">Submit an RFQ to see AI-matched suppliers with explainable recommendations.</p>
            </div>
        </main>
        
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                // Populate categories dropdown
                const categories = [
                    "Electronics Manufacturing", 
                    "Industrial Equipment", 
                    "Mechanical Parts", 
                    "Plastic Goods",
                    "Textile Production", 
                    "Chemical Processing", 
                    "Food Processing", 
                    "Metal Fabrication"
                ];
                
                const categorySelect = document.getElementById('category');
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    categorySelect.appendChild(option);
                });
                
                // Populate states dropdown
                const states = [
                    "Maharashtra", "Gujarat", "Tamil Nadu", "Karnataka", 
                    "Uttar Pradesh", "Delhi", "Haryana", "Punjab"
                ];
                
                const stateSelect = document.getElementById('state');
                states.forEach(state => {
                    const option = document.createElement('option');
                    option.value = state;
                    option.textContent = state;
                    stateSelect.appendChild(option);
                });
                
                // Handle form submission
                const rfqForm = document.getElementById('rfqForm');
                rfqForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    // Show loading state
                    const resultsContainer = document.getElementById('results');
                    resultsContainer.innerHTML = `
                        <div class="loading">
                            <div class="spinner"></div>
                            <p>AI matching engine is finding the best suppliers...</p>
                        </div>
                    `;
                    
                    // Collect form data
                    const formData = new FormData(rfqForm);
                    const rfqData = Object.fromEntries(formData.entries());
                    
                    try {
                        // Send to API for matching
                        const response = await fetch('/api/match-suppliers', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(rfqData)
                        });
                        
                        if (!response.ok) {
                            throw new Error('Failed to get matches');
                        }
                        
                        const data = await response.json();
                        displayResults(data, rfqData);
                    } catch (error) {
                        console.error('Error:', error);
                        resultsContainer.innerHTML = `
                            <div class="card">
                                <h3>Error</h3>
                                <p>Failed to get matching suppliers. Please try again.</p>
                            </div>
                        `;
                    }
                });
                
                // Handle reset button
                const resetBtn = document.getElementById('resetBtn');
                resetBtn.addEventListener('click', function() {
                    rfqForm.reset();
                    document.getElementById('results').innerHTML = `
                        <p class="text-center">Submit an RFQ to see AI-matched suppliers with explainable recommendations.</p>
                    `;
                });
                
                // Function to display results
                function displayResults(suppliers, rfqData) {
                    const resultsContainer = document.getElementById('results');
                    
                    if (!suppliers || suppliers.length === 0) {
                        resultsContainer.innerHTML = `
                            <div class="card">
                                <h3>No Matching Suppliers</h3>
                                <p>We couldn't find any suppliers matching your requirements. Try adjusting your RFQ details.</p>
                            </div>
                        `;
                        return;
                    }
                    
                    // Create summary card
                    let resultsHTML = `
                        <div class="card">
                            <h3>AI Matching Summary</h3>
                            <p>Based on your RFQ for <strong>${rfqData.title}</strong> in the <strong>${rfqData.category}</strong> category, 
                            we found <strong>${suppliers.length}</strong> potential suppliers with strong matches.</p>
                            <p>The AI matching engine evaluated suppliers based on category specialization, price competitiveness, 
                            past performance, delivery time capability, ratings, and experience.</p>
                        </div>
                        
                        <div class="grid">
                    `;
                    
                    // Create supplier cards
                    suppliers.forEach(supplier => {
                        const matchScore = (supplier.match_score * 100).toFixed(0);
                        const scoreColor = matchScore > 80 ? 'var(--success-color)' : 
                                          matchScore > 60 ? 'var(--primary-color)' : 
                                          matchScore > 40 ? 'var(--warning-color)' : 'var(--danger-color)';
                        
                        resultsHTML += `
                            <div class="supplier-card">
                                <div class="match-score" style="background-color: ${scoreColor};">${matchScore}% Match</div>
                                
                                <div class="supplier-info">
                                    <h3>${supplier.company_name}</h3>
                                    <p>${supplier.name} | ${supplier.city}, ${supplier.state}</p>
                                    <p>Specializes in: ${supplier.specializations.join(", ")}</p>
                                </div>
                                
                                <div class="metrics">
                                    <div class="metric">Rating: <span>${supplier.rating.toFixed(1)}/5.0</span></div>
                                    <div class="metric">Completed: <span>${supplier.total_completed}</span></div>
                                    <div class="metric">Delivery: <span>${supplier.avg_delivery_days.toFixed(1)} days</span></div>
                                    <div class="metric">Success Rate: <span>${(supplier.completion_rate * 100).toFixed(0)}%</span></div>
                                </div>
                                
                                <div class="explanations">
                                    <div class="explanation-title">Why this match?</div>
                        `;
                        
                        // Top 3 factors for explaining the match
                        const topFactors = supplier.shap_values.slice(0, 3);
                        topFactors.forEach(factor => {
                            const isPositive = factor.value >= 0;
                            const barWidth = Math.min(Math.abs(factor.value) * 200, 50) + '%';
                            
                            resultsHTML += `
                                <div class="explanation">
                                    <div class="explanation-name">${factor.name}</div>
                                    <div class="bar-container">
                                        <div class="bar ${isPositive ? 'positive' : 'negative'}" 
                                             style="width: ${barWidth}"></div>
                                    </div>
                                    <div class="explanation-value ${isPositive ? 'positive-value' : 'negative-value'}">
                                        ${isPositive ? '+' : ''}${factor.value.toFixed(2)}
                                    </div>
                                </div>
                                <div class="explanation-text">${factor.explanation}</div>
                            `;
                        });
                        
                        resultsHTML += `
                                </div>
                            </div>
                        `;
                    });
                    
                    resultsHTML += `</div>`;
                    resultsContainer.innerHTML = resultsHTML;
                }
            });
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/api/match-suppliers")
async def match_suppliers(request: Request):
    """API endpoint to match suppliers for an RFQ"""
    # Get request body as JSON
    rfq_data = await request.json()
    
    # Match suppliers
    matched_suppliers = match_suppliers_for_rfq(rfq_data)
    
    return matched_suppliers

# Run the application
if __name__ == "__main__":
    print("Starting Bell24h RFQ Matching Demo on port 5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
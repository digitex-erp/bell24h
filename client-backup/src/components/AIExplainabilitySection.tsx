import React from 'react';
import { BarChart2, AlertCircle, CheckCircle, Info, Shield } from 'lucide-react';

const AIExplainabilitySection: React.FC = () => {
  return (
    <div className="ai-explainability-section">
      <div className="section-header">
        <h2 className="section-title">AI Explainability</h2>
        <p className="section-subtitle">
          Understand how our AI makes decisions with transparent SHAP/LIME visualization
        </p>
      </div>

      <div className="explainability-container">
        <div className="explainability-visual">
          <div className="shap-chart">
            <h3>Supplier Risk Scoring</h3>
            <div className="chart-container">
              <div className="chart-bars">
                <div className="chart-bar">
                  <div className="bar-label">Payment History</div>
                  <div className="bar-value" style={{ width: '85%', backgroundColor: '#0077b6' }}>
                    <span>85%</span>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Delivery Time</div>
                  <div className="bar-value" style={{ width: '72%', backgroundColor: '#0096c7' }}>
                    <span>72%</span>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Quality Metrics</div>
                  <div className="bar-value" style={{ width: '93%', backgroundColor: '#00b4d8' }}>
                    <span>93%</span>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Communication</div>
                  <div className="bar-value" style={{ width: '68%', backgroundColor: '#48cae4' }}>
                    <span>68%</span>
                  </div>
                </div>
                <div className="chart-bar">
                  <div className="bar-label">Market Reputation</div>
                  <div className="bar-value" style={{ width: '78%', backgroundColor: '#90e0ef' }}>
                    <span>78%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="explainability-content">
          <h3>Transparent Decision Making</h3>
          <p>
            Bell24H uses SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) 
            to provide transparency in how our AI evaluates suppliers and matches them to your RFQs.
          </p>
          
          <div className="explainability-features">
            <div className="explainability-feature">
              <div className="feature-icon">
                <BarChart2 size={24} />
              </div>
              <div className="feature-content">
                <h4>Feature Importance</h4>
                <p>See which factors most influence supplier rankings and recommendations</p>
              </div>
            </div>
            
            <div className="explainability-feature">
              <div className="feature-icon">
                <AlertCircle size={24} />
              </div>
              <div className="feature-content">
                <h4>Risk Indicators</h4>
                <p>Understand potential risks with each supplier based on historical data</p>
              </div>
            </div>
            
            <div className="explainability-feature">
              <div className="feature-icon">
                <CheckCircle size={24} />
              </div>
              <div className="feature-content">
                <h4>Decision Confidence</h4>
                <p>View the confidence level of AI recommendations with statistical backing</p>
              </div>
            </div>
            
            <div className="explainability-feature">
              <div className="feature-icon">
                <Info size={24} />
              </div>
              <div className="feature-content">
                <h4>Interactive Explanations</h4>
                <p>Explore how changing requirements affects supplier matches in real-time</p>
              </div>
            </div>
            
            <div className="explainability-feature">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <div className="feature-content">
                <h4>Bias Detection</h4>
                <p>Our system actively monitors and prevents algorithmic bias in recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIExplainabilitySection;

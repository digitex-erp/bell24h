
import numpy as np
from typing import Dict, List
from sklearn.ensemble import RandomForestRegressor

class BidPredictor:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        
    def prepare_features(self, rfq: Dict) -> np.ndarray:
        """Extract features from RFQ for prediction"""
        features = [
            float(rfq['quantity']),
            float(rfq['budget']),
            float(rfq['delivery_days']),
            float(rfq.get('urgency_level', 1)),
            float(rfq.get('complexity_score', 0.5))
        ]
        return np.array(features).reshape(1, -1)
    
    async def predict_bid_price(self, rfq: Dict, historical_bids: List[Dict]) -> Dict:
        """Predict optimal bid price range"""
        if len(historical_bids) < 10:
            return {
                'min_price': rfq['budget'] * 0.8,
                'max_price': rfq['budget'] * 1.2,
                'confidence': 0.5
            }
            
        # Prepare training data
        X = np.array([self.prepare_features(bid['rfq'])[0] for bid in historical_bids])
        y = np.array([bid['price'] for bid in historical_bids])
        
        # Train model
        self.model.fit(X, y)
        
        # Make prediction
        predicted_price = self.model.predict(self.prepare_features(rfq))[0]
        
        return {
            'min_price': predicted_price * 0.9,
            'max_price': predicted_price * 1.1,
            'predicted_price': predicted_price,
            'confidence': self.model.score(X, y)
        }
    
    def get_price_factors(self, rfq: Dict) -> List[Dict]:
        """Get factors influencing the predicted price"""
        return [
            {'factor': 'Quantity', 'impact': 'high' if rfq['quantity'] > 1000 else 'medium'},
            {'factor': 'Delivery Timeline', 'impact': 'high' if rfq['delivery_days'] < 7 else 'low'},
            {'factor': 'Market Demand', 'impact': 'medium'},
            {'factor': 'Complexity', 'impact': 'high' if rfq.get('complexity_score', 0.5) > 0.7 else 'medium'}
        ]

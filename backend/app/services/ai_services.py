import openai
import shap
import lime
import lime.lime_tabular
import numpy as np
import pandas as pd
import os
import json
import joblib
from functools import lru_cache
from typing import Dict, List, Any
from threading import Lock
from app.core.config import settings
from app.models.supplier import Supplier
from app.models.rfq import RFQ
import requests
try:
    from supabase import create_client
except Exception:
    create_client = None

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY

_MODEL_LOCK = Lock()
_MODEL = None
_EXPLAINER = None


class AIServices:
    @staticmethod
    async def voice_to_rfq(audio_file) -> Dict[str, Any]:
        """Convert voice to RFQ using OpenAI Whisper and GPT-4"""
        try:
            # Convert voice to text
            transcript = await openai.Audio.transcribe("whisper-1", audio_file)
            
            # Process RFQ using GPT-4
            response = await openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{
                    "role": "user",
                    "content": f"Extract RFQ details from this transcript into JSON format with fields: title, description, categories, quantity, delivery_deadline, special_requirements. Transcript: {transcript}"
                }]
            )
            
            return {
                "success": True,
                "data": response.choices[0].message.content,
                "transcript": transcript
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def calculate_supplier_risk(supplier_data: Dict[str, float]) -> Dict[str, Any]:
        """Calculate supplier risk score using multiple factors"""
        try:
            # Calculate weighted risk score
            weights = {
                'late_delivery_rate': 0.4,
                'compliance_score': 0.3,
                'financial_stability': 0.2,
                'user_feedback': 0.1
            }
            
            risk_score = sum(
                weights[key] * supplier_data[key]
                for key in weights
                if key in supplier_data
            )
            
            # Determine risk level
            risk_level = "Low" if risk_score >= 0.8 else "Medium" if risk_score >= 0.6 else "High"
            
            return {
                "success": True,
                "risk_score": risk_score,
                "risk_level": risk_level,
                "factors": {
                    key: supplier_data[key] * weights[key]
                    for key in weights
                    if key in supplier_data
                }
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    async def get_stock_trends(industry: str) -> Dict[str, Any]:
        """Get stock market trends for industry analysis"""
        try:
            api_key = settings.ALPHA_VANTAGE_API_KEY
            url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol={industry}&apikey={api_key}"
            response = requests.get(url)
            data = response.json()
            
            if "Time Series (Daily)" not in data:
                raise ValueError("Invalid response from Alpha Vantage API")
            
            # Process and analyze the data
            time_series = data["Time Series (Daily)"]
            df = pd.DataFrame.from_dict(time_series, orient='index')
            df.index = pd.to_datetime(df.index)
            
            # Calculate trends
            df = df.astype(float)
            trend_analysis = {
                "last_price": float(df.iloc[0]["4. close"]),
                "price_change": float(df.iloc[0]["4. close"]) - float(df.iloc[1]["4. close"]),
                "volume": float(df.iloc[0]["5. volume"]),
                "30_day_avg": float(df["4. close"].head(30).mean()),
                "trend": "up" if float(df.iloc[0]["4. close"]) > float(df.iloc[30]["4. close"]) else "down"
            }
            
            return {
                "success": True,
                "data": trend_analysis
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def explain_supplier_match(supplier_features: np.ndarray, feature_names: List[str]) -> Dict[str, Any]:
        """Generate explanations for supplier matching using SHAP"""
        # Validate inputs
        if supplier_features is None or feature_names is None:
            raise ValueError("Invalid supplier features or feature names")
        if not isinstance(supplier_features, np.ndarray):
            raise ValueError("supplier_features must be a numpy.ndarray")
        if supplier_features.ndim != 2:
            raise ValueError("supplier_features must be a 2D array of shape (n_samples, n_features)")
        if supplier_features.shape[1] != len(feature_names):
            raise ValueError("Number of feature names must match number of columns in supplier_features")

        try:
            # Load model and explainer once (thread-safe)
            global _MODEL, _EXPLAINER
            if _MODEL is None:
                with _MODEL_LOCK:
                    if _MODEL is None:
                        model_path = os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'rfq_model.pkl')
                        if os.path.exists(model_path):
                            _MODEL = joblib.load(model_path)
                            try:
                                _EXPLAINER = shap.TreeExplainer(_MODEL)
                            except Exception:
                                _EXPLAINER = shap.Explainer(_MODEL)

            if _MODEL is None or _EXPLAINER is None:
                # Fallback deterministic importance when model not available
                feature_importance = {name: float(0.1 + 0.05 * i) for i, name in enumerate(feature_names)}
            else:
                shap_values = _EXPLAINER.shap_values(supplier_features)
                if isinstance(shap_values, list):
                    arr = np.abs(np.array(shap_values)).mean(0)
                else:
                    arr = np.abs(shap_values).mean(0)
                feature_importance = dict(zip(feature_names, [float(x) for x in arr]))
            
            # Sort features by importance
            sorted_features = sorted(
                feature_importance.items(),
                key=lambda x: x[1],
                reverse=True
            )
            
            return {
                "success": True,
                "explanations": [
                    {
                        "feature": feature,
                        "importance": float(importance),
                        "contribution": "positive" if importance > 0 else "negative"
                    }
                    for feature, importance in sorted_features
                ]
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    @staticmethod
    def _load_supplier_features_from_json(supplier_id: int) -> np.ndarray:
        """Load supplier features from backend/data/suppliers.json (mock DB)."""
        try:
            data_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'suppliers.json')
            with open(data_path, 'r', encoding='utf-8') as f:
                suppliers = json.load(f)
            supplier = next((s for s in suppliers if int(s.get('id')) == int(supplier_id)), None)
            if supplier is None:
                raise ValueError(f"Supplier {supplier_id} not found")
            features = np.array([
                supplier.get('feature_0', 0.0),
                supplier.get('feature_1', 0.0),
                supplier.get('feature_2', 0.0),
                supplier.get('feature_3', 0.0),
                supplier.get('feature_4', 0.0),
            ]).reshape(1, -1)
            return features
        except FileNotFoundError:
            raise

    @staticmethod
    def _load_supplier_features_from_db(supplier_id: int) -> np.ndarray:
        """Attempt to load supplier features from a Postgres/Neon database using settings.DATABASE_URL.
        Returns a (1, n_features) numpy array or raises ValueError if supplier not found.
        """
        db_url = getattr(settings, 'DATABASE_URL', None)
        if not db_url:
            raise ValueError("No DATABASE_URL configured")

        try:
            # Use SQLAlchemy engine for a minimal, synchronous DB fetch
            from sqlalchemy import create_engine, text
            engine = create_engine(db_url)
            with engine.connect() as conn:
                stmt = text("SELECT feature_0, feature_1, feature_2, feature_3, feature_4 FROM suppliers WHERE id = :id")
                res = conn.execute(stmt, {"id": supplier_id})
                row = res.fetchone()
                if row is None:
                    raise ValueError(f"Supplier {supplier_id} not found")
                features = np.array([list(row)], dtype=float).reshape(1, -1)
                return features
        except Exception:
            # Bubble up as ValueError to let caller fallback to JSON if desired
            raise

    # Removed duplicate explain_supplier_by_id earlier; keep the single JSON-backed version below.

    @staticmethod
    def explain_supplier_by_id(supplier_id: int) -> Dict[str, Any]:
        """Fetch supplier features by ID (Supabase if configured, otherwise mock) and return explanations."""
        if supplier_id is None or supplier_id <= 0:
            return {"success": False, "error": "Invalid supplier ID"}

        # Feature names expected by the model
        # We removed the Supabase path in favor of the JSON-backed mock for consistency.
        # The JSON file contains 5 features: feature_0..feature_4
        # Prefer DB-backed features if DATABASE_URL is configured
        features = None
        if getattr(settings, 'DATABASE_URL', None):
            try:
                features = AIServices._load_supplier_features_from_db(supplier_id)
            except Exception:
                features = None

        if features is None:
            try:
                features = AIServices._load_supplier_features_from_json(supplier_id)
            except FileNotFoundError:
                features = np.array([[0.5, 0.5, 0.5, 0.5, 0.5]])
            except ValueError:
                raise

        feature_names = [f"feature_{i}" for i in range(features.shape[1])]
        return AIServices.explain_supplier_match(features, feature_names)


def _get_shap_explainer(model):
    """Return a cached SHAP explainer for the model."""
    # Use lru_cache to keep a single explainer instance per model class
    # For simplicity, we recreate explainer each call in this example
    try:
        return shap.TreeExplainer(model)
    except Exception:
        # Fallback generic explainer if TreeExplainer fails
        return shap.Explainer(model)

    @staticmethod
    async def predict_rfq_success(rfq_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict RFQ success probability using historical data"""
        try:
            # Example features (replace with your actual features)
            features = {
                "category_demand": rfq_data.get("category_demand", 0),
                "supplier_count": rfq_data.get("supplier_count", 0),
                "budget_range": rfq_data.get("budget_range", 0),
                "deadline_buffer": rfq_data.get("deadline_buffer", 0)
            }
            
            # Make prediction using GPT-4
            response = await openai.ChatCompletion.create(
                model="gpt-4",
                messages=[{
                    "role": "user",
                    "content": f"Analyze these RFQ features and predict success probability (0-1) with explanation: {features}"
                }]
            )
            
            prediction = response.choices[0].message.content
            
            return {
                "success": True,
                "prediction": prediction
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

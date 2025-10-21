import os
import sys
from pathlib import Path
import numpy as np
import joblib
import pytest
from unittest import mock

# Ensure backend/app is importable as 'app' during pytest runs
ROOT = Path(__file__).resolve().parents[1]  # backend/
sys.path.insert(0, str(ROOT))

# Create minimal stubs for app.db.base and related imports to avoid DB setup in unit tests
import types
if 'app.db.base' not in sys.modules:
    mod = types.ModuleType('app.db.base')
    class DummyBase: pass
    setattr(mod, 'Base', DummyBase)
    sys.modules['app.db.base'] = mod
    # Also ensure 'app.db' package exists
    pkg = types.ModuleType('app.db')
    sys.modules['app.db'] = pkg

from app.services.ai_services import AIServices


def test_explain_supplier_match_model_present(monkeypatch, tmp_path):
    # Ensure model file exists
    model_dir = tmp_path / "models"
    model_dir.mkdir()
    model_path = model_dir / "rfq_model.pkl"
    # create a minimal model using joblib dump of a simple object
    joblib.dump({"dummy": True}, str(model_path))

    # Patch the path in service to point to tmp model
    service_dir = os.path.dirname(os.path.dirname(__file__))  # backend/app
    monkeypatch.setenv('PYTHONPATH', service_dir)

    # Monkeypatch the model location resolution
    monkeypatch.setattr('app.services.ai_services.os.path', mock.Mock(**{
        'join': lambda *args, **kwargs: str(model_path),
        'exists': lambda path: True
    }))

    # Patch joblib.load to return a dummy model with predictable behavior
    def fake_load(p):
        class M:
            def predict(self, X):
                return np.array([0.5])
        return M()

    monkeypatch.setattr('app.services.ai_services.joblib.load', fake_load)

    # Patch SHAP explainer to return fixed values
    class FakeExplainer:
        def shap_values(self, X):
            return np.array([[0.1, 0.2, 0.3, 0.4]])
    monkeypatch.setattr('app.services.ai_services.shap.TreeExplainer', lambda m: FakeExplainer())

    features = np.array([[0.1, 0.2, 0.3, 0.4]])
    names = ["a", "b", "c", "d"]
    res = AIServices.explain_supplier_match(features, names)
    assert res["success"] is True
    assert "explanations" in res
    assert isinstance(res["explanations"], list)
    assert res["explanations"][0]["feature"] == "d"  # highest importance last -> sorted desc


def test_explain_supplier_match_no_model(monkeypatch):
    # Simulate missing model
    monkeypatch.setattr('app.services.ai_services.os.path.exists', lambda x: False)
    features = np.array([[0.1, 0.2, 0.3, 0.4]])
    names = ["a", "b", "c", "d"]
    res = AIServices.explain_supplier_match(features, names)
    assert res["success"] is True
    assert len(res["explanations"]) == 4


def test_explain_supplier_match_invalid_input():
    with pytest.raises(Exception):
        # Pass bad shapes
        AIServices.explain_supplier_match(None, None)

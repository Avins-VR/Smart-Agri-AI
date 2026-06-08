# backend/services/pest_service.py
"""
Pest detection service using EfficientNet B0.
Exact port of load_pest_model(), preprocess_pest_image(), predict_pest()
from app.py — no logic changes.
"""

import os
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image

# ── Lazy singleton cache (mirrors @st.cache_resource) ────────────────────────
_pest_model = None


def load_pest_model():
    """
    Load EfficientNet-B0 pest classifier from disk.
    Exact same architecture as training — no changes.
    """
    global _pest_model

    if _pest_model is not None:
        return _pest_model

    import timm

    project_root = os.path.dirname(
            os.path.dirname(os.path.abspath(__file__))
        )

    model_path = os.path.join(
        project_root,
        "ml_models",
        "pest",
        "best_model.pth"
    )

    print("MODEL PATH:", model_path)
    print("MODEL EXISTS:", os.path.exists(model_path))
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Pest model not found at: {model_path}")

    # EXACT SAME MODEL AS TRAINING
    model = timm.create_model("efficientnet_b0", pretrained=False)

    # EXACT SAME CLASSIFIER
    in_features = model.classifier.in_features
    model.classifier = nn.Sequential(
        nn.Dropout(0.50),
        nn.Linear(in_features, 128),
        nn.ReLU(),
        nn.Dropout(0.40),
        nn.Linear(128, 2),
    )

    # LOAD MODEL
    model.load_state_dict(
        torch.load(model_path, map_location=torch.device("cpu"))
    )
    model.eval()

    _pest_model = model
    return _pest_model


def preprocess_pest_image(image: Image.Image) -> torch.Tensor:
    """
    Preprocess PIL image for inference.
    Exact same transform pipeline as training — no changes.
    """
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.GaussianBlur(kernel_size=3, sigma=(0.1, 0.5)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std =[0.229, 0.224, 0.225],
        ),
    ])

    image  = image.convert("RGB")
    tensor = transform(image)
    tensor = tensor.unsqueeze(0)
    return tensor


def predict_pest(image: Image.Image) -> tuple[str, float]:
    """
    Run pest detection on a PIL image.
    Exact port of predict_pest() from app.py — no logic changes.

    Returns
    -------
    (predicted_class: str, confidence_score: float)
    predicted_class ∈ {"Healthy", "Pest Attack"}
    confidence_score is 0–100 rounded to 2 decimal places.
    """
    CLASS_NAMES = ["Healthy", "Pest Attack"]

    model      = load_pest_model()
    img_tensor = preprocess_pest_image(image)

    with torch.no_grad():
        outputs       = model(img_tensor)
        probabilities = torch.softmax(outputs, dim=1)
        confidence, prediction = torch.max(probabilities, 1)

    predicted_class  = CLASS_NAMES[prediction.item()]
    confidence_score = round(confidence.item() * 100, 2)

    return predicted_class, confidence_score
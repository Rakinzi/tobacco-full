import os
import torch
import requests
from flask import Flask, request, jsonify
from PIL import Image
import clip
import numpy as np

app = Flask(__name__)

# CLIP model and device setup
device = "cuda" if torch.cuda.is_available() else "cpu"
model, preprocess = clip.load("ViT-B/32", device=device)

# Tobacco-related classes to detect
TOBACCO_CLASSES = [
    "tobacco leaves",
    "tobacco plant",
    "dried tobacco",
    "tobacco field",
    "tobacco harvest",
    "tobacco drying",
    "tobacco bales",
]

# Threshold for tobacco detection (cosine similarity)
SIMILARITY_THRESHOLD = 0.25  # adjust as needed

# Default login credentials for TIMB officer (use env to override)
DEFAULT_EMAIL = os.getenv('LARAVEL_EMAIL', 'timb@email.com')
DEFAULT_PASSWORD = os.getenv('LARAVEL_PASSWORD', 'password123')

# Laravel API endpoints
LOGIN_URL = 'http://127.0.0.1:8000/api/login'
CLEARANCE_URL_TEMPLATE = 'http://127.0.0.1:8000/api/tobacco_listings/{listing_id}/timb_clearance'

def is_tobacco_image(image_path):
    """
    Detect if an image contains tobacco using CLIP via cosine similarity
    """
    try:
        image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
        text_tokens = clip.tokenize(TOBACCO_CLASSES).to(device)
        with torch.no_grad():
            img_feats = model.encode_image(image)
            txt_feats = model.encode_text(text_tokens)
        img_feats = img_feats / img_feats.norm(dim=-1, keepdim=True)
        txt_feats = txt_feats / txt_feats.norm(dim=-1, keepdim=True)
        sims = (img_feats @ txt_feats.T).squeeze(0).cpu().numpy()
        max_sim = float(np.max(sims))
        print(f"Max cosine similarity: {max_sim}")
        return max_sim > SIMILARITY_THRESHOLD
    except Exception as e:
        print(f"Error in tobacco detection: {e}")
        return False

@app.route('/detect', methods=['POST'])
def detect_tobacco():
    """
    Endpoint to detect tobacco in uploaded images
    """
    # No client auth token check; rely on login for clearance operations
    if 'images[]' not in request.files:
        return jsonify({'status': 'error', 'message': 'No images uploaded'}), 400

    images = request.files.getlist('images[]')
    listing_id = request.form.get('listing_id')
    if not listing_id:
        return jsonify({'status': 'error', 'message': 'No listing ID provided'}), 400

    upload_dir = 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    results = []

    try:
        for img in images:
            path = os.path.join(upload_dir, img.filename)
            img.save(path)
            detected = is_tobacco_image(path)
            results.append(detected)
            os.remove(path)

        tobacco_present = any(results)
        if tobacco_present:
            # Login to get dynamic token
            login_resp = requests.post(LOGIN_URL, json={
                'email': DEFAULT_EMAIL,
                'password': DEFAULT_PASSWORD
            })
            if login_resp.ok:
                token = login_resp.json().get('token')
                if token:
                    clearance_url = CLEARANCE_URL_TEMPLATE.format(listing_id=listing_id)
                    clr_resp = requests.post(
                        clearance_url,
                        headers={'Authorization': f'Bearer {token}', 'Accept': 'application/json'}
                    )
                    print(f"Clearance status: {clr_resp.status_code}")
                else:
                    print("Login succeeded but no token received")
            else:
                print(f"Login failed: {login_resp.status_code}")

        return jsonify({'status': 'success', 'is_tobacco': tobacco_present, 'detection_results': results})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    os.environ.setdefault('FLASK_ENV', 'development')
    app.run(debug=False, port=5000)

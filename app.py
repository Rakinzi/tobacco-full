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
    "tobacco storage",
    "tobacco bales",
    "tobacco farm",
    "tobacco warehouse"
]

def is_tobacco_image(image_path):
    """
    Detect if an image contains tobacco using CLIP
    
    Args:
        image_path (str): Path to the image file
    
    Returns:
        bool: True if image is likely to contain tobacco, False otherwise
    """
    try:
        # Load and preprocess the image
        image = preprocess(Image.open(image_path)).unsqueeze(0).to(device)
        
        # Prepare text descriptions
        text = clip.tokenize(TOBACCO_CLASSES).to(device)
        
        # Get image and text features
        with torch.no_grad():
            image_features = model.encode_image(image)
            text_features = model.encode_text(text)
        
        # Compute similarity
        similarity = (100.0 * image_features @ text_features.T).softmax(dim=-1)
        
        # Check if any class has high similarity
        max_similarity = similarity.max().item()
        
        print(f"Similarity scores: {similarity}")
        print(f"Max similarity: {max_similarity}")
        
        # Threshold for tobacco detection (adjust as needed)
        return max_similarity > 0.2
    
    except Exception as e:
        print(f"Error in tobacco detection: {e}")
        return False

@app.route('/detect', methods=['POST'])
def detect_tobacco():
    """
    Endpoint to detect tobacco in uploaded images
    
    Expected request:
    - Multipart form data with images
    - Authorization header
    - Listing ID as a parameter
    """
    # Verify authorization token
    auth_token = request.headers.get('Authorization')
    expected_token = os.getenv('LARAVEL_API_TOKEN', '5|76DjmvFhJAw05KH30jqGor4QUcE2SXmXlbcHgWaH1ce87dfb')
    
    if not auth_token or auth_token.split(' ')[-1] != expected_token:
        return jsonify({
            'status': 'error',
            'message': 'Unauthorized'
        }), 401
    
    # Check if images are present
    if 'images[]' not in request.files:
        return jsonify({
            'status': 'error', 
            'message': 'No images uploaded'
        }), 400
    
    # Get images and listing ID
    images = request.files.getlist('images[]')
    listing_id = request.form.get('listing_id')
    
    if not listing_id:
        return jsonify({
            'status': 'error',
            'message': 'No listing ID provided'
        }), 400
    
    # Temporary directory to save uploaded images
    upload_dir = 'uploads'
    os.makedirs(upload_dir, exist_ok=True)
    
    # Track tobacco detection results
    tobacco_detected = []
    
    try:
        # Process each image
        for image in images:
            # Save image temporarily
            image_path = os.path.join(upload_dir, image.filename)
            image.save(image_path)
            
            # Detect tobacco
            is_tobacco = is_tobacco_image(image_path)
            tobacco_detected.append(is_tobacco)
            
            # Clean up temporary file
            os.remove(image_path)
        
        # Determine overall tobacco detection
        is_tobacco = any(tobacco_detected)
        
        # If tobacco is detected, trigger TIMB clearance in Laravel
        if is_tobacco:
            try:
                # Prepare request to Laravel API
                response = requests.post(
                    f'http://127.0.0.1:8000/api/tobacco_listings/{listing_id}/timb_clearance',
                    headers={
                        'Authorization': f'Bearer {expected_token}',
                        'Accept': 'application/json'
                    }
                )
                
                print(f"TIMB Clearance Response: {response.status_code}, {response.text}")
            except Exception as e:
                print(f"Error triggering TIMB clearance: {e}")
        
        return jsonify({
            'status': 'success',
            'is_tobacco': is_tobacco,
            'detection_results': tobacco_detected
        })
    
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Ensure environment variables are set
    os.environ.setdefault('FLASK_ENV', 'development')
    os.environ.setdefault('LARAVEL_API_TOKEN', '5|76DjmvFhJAw05KH30jqGor4QUcE2SXmXlbcHgWaH1ce87dfb')
    
    # Run the Flask app
    app.run(debug=True, port=5000)
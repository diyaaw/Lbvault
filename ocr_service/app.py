from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
from pdf2image import convert_from_path
import re
import os

app = Flask(__name__)

def preprocess_image(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)
    # Deskewing can be added here if needed
    return thresh

def extract_biomarkers(text):
    biomarkers = {}
    
    glucose_match = re.search(r'(?i)glucose\s*.*?(\d+[\.\,]?\d*)', text)
    if glucose_match:
        biomarkers['glucose'] = float(glucose_match.group(1).replace(',', '.'))
        
    hemoglobin_match = re.search(r'(?i)hemoglobin\s*.*?(\d+[\.\,]?\d*)', text)
    if hemoglobin_match:
        biomarkers['hemoglobin'] = float(hemoglobin_match.group(1).replace(',', '.'))
        
    cholesterol_match = re.search(r'(?i)cholesterol\s*.*?(\d+[\.\,]?\d*)', text)
    if cholesterol_match:
        biomarkers['cholesterol'] = float(cholesterol_match.group(1).replace(',', '.'))
        
    return biomarkers

@app.route('/ocr/process', methods=['POST'])
def process_report():
    data = request.json
    file_path = data.get('fileUrl')
    
    if not file_path:
        return jsonify({"error": "No file parameter"}), 400
        
    # Translate relative URL to absolute path 
    # Assumes Node.js is serving from ../backend
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
    full_path = os.path.join(base_dir, file_path.lstrip('/'))
    
    if not os.path.exists(full_path):
        return jsonify({"error": "File not found"}), 404
        
    extracted_text = ""
    
    try:
        if full_path.lower().endswith('.pdf'):
            images = convert_from_path(full_path)
            for img in images:
                open_cv_image = np.array(img)
                processed = preprocess_image(open_cv_image)
                text = pytesseract.image_to_string(processed)
                extracted_text += text + "\n"
        else:
            img = cv2.imread(full_path)
            processed = preprocess_image(img)
            extracted_text = pytesseract.image_to_string(processed)
            
        biomarkers = extract_biomarkers(extracted_text)
        
        return jsonify({
            "text": extracted_text.strip()[:1000] + "...", # Truncated for safety
            "biomarkers": biomarkers
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

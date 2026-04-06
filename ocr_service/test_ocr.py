from PIL import Image, ImageDraw, ImageFont
import os
import requests

# 1. Ensure backend/uploads exists
uploads_dir = '../backend/uploads'
os.makedirs(uploads_dir, exist_ok=True)
image_path = os.path.join(uploads_dir, 'sample_report.png')

# 2. Create a test image with medical text using Pillow
img = Image.new('RGB', (800, 400), color=(255, 255, 255))
d = ImageDraw.Draw(img)

# Fallback to default font if we can't load standard TTF
try:
    font = ImageFont.truetype("Arial.ttf", 36)
except IOError:
    font = ImageFont.load_default()

text_content = """
PATIENT LAB REPORT
-----------------------
Glucose: 104.5 mg/dL
Hemoglobin: 13.8 g/dL
Cholesterol: 195 mg/dL

Notes: All results are within normal parameters.
"""

# Draw the text on image
# Handle text drawing compatibility with newer Pillow
try:
    d.multiline_text((20, 20), text_content, fill=(0, 0, 0), font=font)
except TypeError:
    d.text((20, 20), text_content, fill=(0, 0, 0), font=font)

img.save(image_path)
print(f"Generated test image at: {image_path}")

# 3. Call the local OCR API
api_url = "http://127.0.0.1:5001/ocr/process"
payload = {"fileUrl": "uploads/sample_report.png"}

print(f"Sending POST request to {api_url} with {payload}...")
try:
    response = requests.post(api_url, json=payload)
    print(f"Response Status: {response.status_code}")
    print("Response JSON:")
    print(response.json())
except requests.exceptions.RequestException as e:
    print(f"Failed to connect to OCR service: {e}")

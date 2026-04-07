from flask import Flask, request, jsonify
import logging
from services.ocr_service import process_file_in_memory

app = Flask(__name__)

# Configure basic logging for the controller
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "OCR Service is running",
        "endpoints": ["POST /ocr/process"]
    })

@app.route('/ocr/process', methods=['POST'])
def process_report():
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            logger.warning("No file part in the request")
            return jsonify({"error": "No file parameter in multipart/form-data", "status": "error"}), 400
            
        file = request.files['file']
        
        # If the user does not select a file, the browser submits an empty file without a filename
        if file.filename == '':
            logger.warning("Empty filename submitted")
            return jsonify({"error": "No selected file", "status": "error"}), 400

        # Check for optional preprocessing flag (default to True)
        enable_preprocessing = request.form.get('enable_preprocessing', 'true').lower() == 'true'

        logger.info(f"Received file: {file.filename} (Preprocessing: {enable_preprocessing})")

        # Process the file entirely in memory
        extracted_text = process_file_in_memory(file, file.filename, enable_preprocessing)

        if not extracted_text:
            return jsonify({"error": "Empty OCR output or unsupported file.", "status": "error"}), 400

        # Return standardized JSON response
        return jsonify({
            "text": extracted_text,
            "length": len(extracted_text),
            "status": "success"
        }), 200

    except Exception as e:
        logger.error(f"Internal Server Error: {str(e)}")
        return jsonify({"error": str(e), "status": "error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)

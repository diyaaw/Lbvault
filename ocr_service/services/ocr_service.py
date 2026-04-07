import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from pdf2image import convert_from_bytes
import io

# Load environment variables
load_dotenv()

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# User-provided Poppler Path
POPPLER_PATH = r"C:\Users\diyaw\Downloads\Release-25.12.0-0\poppler-25.12.0\Library\bin"

# Configure Gemini
api_key = os.getenv("GOOGLE_AI_STUDIO_API_KEY")
if not api_key:
    logger.error("GOOGLE_AI_STUDIO_API_KEY not found in environment")
else:
    genai.configure(api_key=api_key)

def process_file_in_memory(file_stream, filename, enable_preprocessing=True):
    """
    Hybrid OCR: Uses local Poppler for PDF conversion to optimize 
    and Gemini 1.5 Flash for high-accuracy text extraction.
    """
    extracted_text = ""
    file_bytes = file_stream.read()
    
    if not file_bytes:
        logger.warning(f"Empty file stream provided for {filename}")
        return ""

    is_pdf = filename.lower().endswith('.pdf')
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = "You are a clinical OCR system. Read this pathology report and extract ALL the text written in it verbatim. Do not summarize or format, just output the raw text extracted from the document."
        
        # --- HYBRID LOGIC ---
        # If it's a PDF, we use local Poppler to convert pages to images to save API bandwidth/quota
        if is_pdf and os.path.exists(POPPLER_PATH):
            logger.info(f"Using local Poppler at {POPPLER_PATH} to convert PDF: {filename}")
            try:
                images = convert_from_bytes(file_bytes, poppler_path=POPPLER_PATH)
                logger.info(f"Converted PDF to {len(images)} images locally.")
                
                consolidated_payload = []
                for img in images:
                    img_byte_arr = io.BytesIO()
                    img.save(img_byte_arr, format='JPEG')
                    consolidated_payload.append({
                        "mime_type": "image/jpeg",
                        "data": img_byte_arr.getvalue()
                    })
                
                response = model.generate_content(consolidated_payload + [prompt])
                extracted_text = response.text
                
            except Exception as pdf_err:
                logger.error(f"Local Poppler conversion failed, falling back to direct Gemini PDF: {str(pdf_err)}")
                response = model.generate_content([{"mime_type": "application/pdf", "data": file_bytes}, prompt])
                extracted_text = response.text
        else:
            # Standard Image or direct PDF fallback
            mime_type = 'application/pdf' if is_pdf else 'image/jpeg'
            if filename.lower().endswith('.png'): mime_type = 'image/png'
            
            logger.info(f"Processing via direct Gemini upload: {filename} ({mime_type})")
            response = model.generate_content([{"mime_type": mime_type, "data": file_bytes}, prompt])
            extracted_text = response.text
        
        logger.info(f"Successfully extracted {len(extracted_text)} characters.")
        return extracted_text.strip()
        
    except Exception as e:
        logger.error(f"Error during Hybrid OCR processing: {str(e)}")
        return f"OCR processing failed: {str(e)}"

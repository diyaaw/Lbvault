# LabVault (HealthScan)

## Overview
LabVault (also referred to as HealthScan) is a comprehensive pathology management and health analytics platform that bridges the gap between patients, doctors, and pathology labs. It features a robust OCR engine for parsing medical reports, multilingual AI-generated voice summaries, and role-based operational dashboards—enabling structured visualization and seamless secure interlinking between medical professionals and patients.

## Features
- **Role-Based Dashboards**: Secure, dedicated portals for Patients, Doctors, and Pathology Labs with specialized functionalities.
- **Dual-Source Report Integration**: Patients and verified pathology labs can seamlessly upload reports with distinct trust levels based on the origin (`isVerified`).
- **Advanced Document OCR & Analytics Engine**: 
  - Rule-based & ML-driven OCR data extraction (using Tesseract LSTM & OpenCV filters) to pull key medical biomarkers (Glucose, Hemoglobin, Cholesterol, etc.) from PDF and image-based lab reports.
  - Automatically structures the extracted data to generate a "One-Glance" Analytics UI Dashboard for monitoring out-of-range biomarkers.
- **Multilingual Voice Summaries (Accessibility)**: Leverages `google-tts-api` to convert AI-generated medical report summaries into accessible audio. Supports English, Hindi, Marathi, and Telugu.
- **Doctor-Patient Interlinking**: Built-in permission flows that allow patients to grant access to participating doctors. Doctors can continuously monitor longitudinal health data and provide clinical notes directly on the reports.

## Tech Stack
### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS v4
- **Data Visualization**: Recharts
- **HTTP/API Client**: Axios
- **Language**: TypeScript

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JWT (JSON Web Tokens), Bcrypt for password hashing
- **File Processing**: Multer (File uploads)
- **Other Utils**: Nodemailer (Email services), `google-tts-api` (Text-to-Speech)

### OCR Microservice
- **Runtime**: Python 3
- **Framework**: Flask
- **OCR Engine**: Pytesseract (Tesseract OCR), pdf2image
- **Image Processing**: OpenCV (`opencv-python-headless`), NumPy, Pillow

## Prerequisites
Before running this application locally, ensure you have the following installed on your system:
- **Node.js**: v18+ recommended
- **Python**: v3.8+ recommended (with `pip`)
- **Tesseract OCR**: Required for text extraction. 
  - Mac: `brew install tesseract`
  - Ubuntu/Debian: `sudo apt install tesseract-ocr`
  - Windows: [Download Installer](https://github.com/UB-Mannheim/tesseract/wiki)
- **Poppler**: Required by `pdf2image` to convert PDFs into image arrays.
  - Mac: `brew install poppler`
  - Ubuntu/Debian: `sudo apt install poppler-utils`
  - Windows: [Download Installer](https://github.com/oschwartz10612/poppler-windows/releases/)
- **MongoDB**: A running MongoDB instance (Local or MongoDB Atlas)

---

## How to Run the Project Local Environment

The architecture runs as three decoupled services. They must all be running simultaneously to test the system comprehensively.

### 1. Database and Environment Setup
Before starting the servers, you must configure the backend environment definitions.
Navigate to the `backend` directory:
```bash
cd backend
```
Ensure you have a `.env` file with at least the following details (adjust as necessary for your local setup):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 2. Start the Backend Server (Express)
Open a terminal instance and navigate to the backend directory:
```bash
cd backend
npm install
npm run dev
```
The node backend should now be running and connected to MongoDB on `http://localhost:5000` (or your overriding port).

### 3. Start the OCR Service (Flask)
Open a *new* terminal instance and navigate to the OCR service directory:
```bash
cd ocr_service

# Create and activate a virtual environment
python3 -m venv venv
# On Mac/Linux:
source venv/bin/activate  
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Run the Flask app
python app.py
```
*The Flask microservice listens for backend data processing requests on `http://localhost:5001/`.*

### 4. Start the Frontend Application (Next.js)
Open a third terminal instance and navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```
The Next.js frontend will boot up on `http://localhost:3000`. You can visit this URL in your browser to interact with the Patient, Doctor, and Pathology Lab features.

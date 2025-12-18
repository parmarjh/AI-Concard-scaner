
# 📇 AI Concard Scanner
> **Next-Generation Business Card Intelligence**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Tech](https://img.shields.io/badge/tech-React%20%7C%20Vite%20%7C%20Gemini%20AI-purple.svg)]()

AI Concard Scanner is a state-of-the-art **Progressive Web Application (PWA)** that leverages **Computer Vision** and **Large Language Models (LLMs)** to digitize physical visiting cards. It transforms raw RGB image data into structured, actionable contact information using advanced AI inference.

---

## 🌟 Features

### 🧠 Advanced AI Detection
- **Handwritten Text Recognition**: Capable of deciphering complex handwriting (pen/pencil) on physical paper cards.
- **Intelligent Inference**: Automatically infers missing details (e.g., deriving website URLs from email domains) to complete contact profiles.
- **Unstructured Data Parsing**: Robustly handles non-standard card layouts and artistic designs.
- **Original Card Link**: Maintains a digital link to the original handwritten card image for side-by-side verification.

### ⚡ Core Capabilities
- **Real-time OCR & Extraction**: powered by **Google Gemini 2.5 Flash**.
- **Barcode & QR Scanner**: Integrated scanning for vCard QR codes with auto-parsing.
- **Smart Barcode Generation**: Instantly generates **2D & 3D-visualized QR codes** for any contact for seamless sharing.
- **Auto Avatar Generation**: Creates unique 3D/Gradient avatars or fetches AI-generated personas for contacts without photos.
- **Cloud Integration**: Native **Google Contacts Sync** (1-click save) using the People API.

### 💾 Export & Sharing
- **Universal vCard (.vcf) Export**: Compatible with iOS, Android, and Outlook.
- **Web Share API**: Native mobile sharing integration.
- **Multi-format Support**: Export data to CSV, JSON, or Excel.

### 🔬 AI Research Assistant (NEW!)
- **Instant Research Paper Generation**: Generate comprehensive research papers on any topic using AI
- **Professional Formatting**: Well-structured papers with abstract, sections, conclusion, and future development ideas
- **Multi-Format Export**: Download research papers in multiple formats:
  - **PDF**: Professional PDF documents with proper formatting
  - **DOCX**: Microsoft Word format for easy editing and collaboration
  - **Markdown**: Plain text format perfect for README files and documentation
- **AI-Powered Content**: Leverages Google Gemini AI for intelligent content generation
- **Real-time Generation**: Get complete research papers in seconds

### 🧪 Testing Infrastructure
- **Vitest Integration**: Comprehensive unit testing framework
- **React Testing Library**: Component testing for React components
- **Continuous Testing**: Automated test suite with `npm test`
- **High Code Coverage**: Ensuring reliability and maintainability

---

## 🎥 Demo Videos

### Watch AI Concard Scanner in Action
*(Click thumbnails to play)*

| Mobile Scanning | Handwritten Detection | 3D Visualization |
|:---:|:---:|:---:|
| [![Mobile Scanning](https://via.placeholder.com/200x120?text=Mobile+Scan)](https://example.com) | [![Handwritten](https://via.placeholder.com/200x120?text=Handwritten+AI)](https://example.com) | [![Avatars](https://via.placeholder.com/200x120?text=3D+Code+Gen)](https://example.com) |

---

## ⚙️ How it Works: The Algorithm

The system employs a multi-stage **Vision-Language Pipeline** to process cards:

### 1. **RGB Image Acquisition** 📸
The process begins with capturing a high-resolution **RGB Image** via the device camera or file upload.
- **Input**: Raw pixel data (RGB channels).
- **Preprocessing**: Image normalization, resizing, and base64 encoding.

### 2. **3D Step-by-Step Processing** 🔄
The "3D" approach refers to the three dimensions of analysis: **Visual**, **Textual**, and **Contextual**.

1.  **Visual Layer (Segmentation)**:
    - Identifies the card boundaries within the image.
    - Localizes text regions and graphical elements (logos, QR codes).
2.  **Textual Layer (OCR & Recognition)**:
    - **Printed Text**: High-accuracy optical character recognition.
    - **Handwritten Text**: Specialized model handling for pen/pencil strokes and cursive variance.
3.  **Contextual Layer (Entity Extraction)**:
    - The LLM parses the recognized text chunks.
    - **Token Classification**: Categorizes tokens into Name, Title, Company, etc.
    - **Inference Engine**: Reconstructs missing relations (e.g., associating a specific phone number with "Mobile" vs "Work").

### 3. **Data Structuring & Sync** 🧬
Raw inference is mapped to a strict **JSON Schema** and synchronized:
```json
{
  "name": "Jatin parmar",
  "title": "Senior AI Engineer",
  "company": "Shiva ai llp",
  "email": ["parmrjatin4911.com"],
  "phone": ["+91-7016681896"]
}
```
*Data is accepted into the local PouchDB/Firestore and optionally pushed to Google Contacts.*

---

## 🏗️ Repository Structure

```tree
AI-visiting-card-scaner/
├── components/           # UI Components (React)
│   ├── AddCardModal.tsx  # Core AI Integration
│   ├── ContactQRCode.tsx # 2D/3D Barcode Generation
│   ├── BarcodeScanner.tsx# QR/Barcode Scanning Logic
│   ├── Navbar.tsx        # Navigation Component
│   └── icons.tsx         # Icon Library
├── utils/                # Helper Algorithms
│   ├── googleContacts.ts # Google People API Integration
│   ├── avatarGenerator.ts# Avatar Gen Logic
│   ├── contactSaver.ts   # vCard/Export Logic
│   ├── geminiGenerator.ts# Research Paper AI Generation
│   └── exportResearch.ts # Multi-format Export (PDF/DOCX/MD)
├── pages/                # Route Pages
│   ├── DashboardPage.tsx # Main Contact Dashboard
│   ├── ResearchPage.tsx  # AI Research Assistant
│   ├── AdminPage.tsx     # Admin Panel
│   └── ArViewPage.tsx    # AR Visualization
├── tests/                # Testing Files
│   ├── App.test.tsx      # App Component Tests
│   └── setupTests.ts     # Test Configuration
├── locales/              # i18n JSON files
├── types.ts              # TypeScript Interfaces
├── firebaseConfig.ts     # Auth Configuration
├── vite.config.ts        # Build & Test Configuration
└── README.md             # This File
```

---

## 💻 Tech Stack & Technology Use

- **Frontend Framework**: React 19, TypeScript, TailwindCSS
- **Build Tool**: Vite (Optimized for speed)
- **AI Core**: Google Gemini API (`gemini-2.0-flash`)
- **Computer Vision**: @zxing/library (Local QR), Gemini Vision (Cloud OCR)
- **Generation Engine**: qrcode (Client-side 2D generation)
- **Integration**: Google People API (Contacts Sync)
- **Avatar Engine**: DiceBear API (HTTP-based generation)
- **Database/Auth**: Firebase (Cloud Firestore & Authentication)
- **PWA**: Service Workers with offline caching strategies
- **Document Export**: jsPDF (PDF), docx (Word), file-saver (Download handling)
- **Testing**: Vitest, React Testing Library, jsdom

---

## 📊 Data Structure & Algorithm

The core data structure driving the application is defined in `types.ts`:

### Contact Entity
The application uses a robust graph-ready structure for contacts:
```typescript
interface Contact {
  id: string;           // UUID v4
  name: string;         // Full Name
  title?: string;       // Professional Role
  company?: string;     // Organization
  phone?: string[];     // Multi-value array
  email?: string[];     // Multi-value array
  imageUrl?: string;    // Avatar URL (generated or uploaded)
  cardImageUrl?: string;// Original scanned RGB image reference
  // ... timestamps
}
```

---

## 🚀 deployment & Evaluation

### Prerequisites
- Node.js 18+
- Firebase Project
- Google Gemini API Key

### Installation & Training (Setup)

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/parmarjh/AI-visiting-card-scaner.git
    cd AI-visiting-card-scaner
    npm install
    ```

2.  **Configuration**:
    - Create `.env` file with `GEMINI_API_KEY=your_key_here`.
    - Setup `firebaseConfig.ts` with your project credentials.

3.  **Run Development Server**:
    ```bash
    npm run dev
    # Access via Network URL for Mobile Testing (e.g., http://192.168.x.x:3000)
    ```

### Evaluation Strategy
- **Accuracy Test**: Upload diverse card samples (glossy, matte, handwritten).
- **Latency Test**: Measure time-to-first-token (TTFT) for extraction.
- **Mobile Responsiveness**: Verify PWA installability and camera access on iOS/Android.

### Using the AI Research Assistant

1. **Navigate to Research Page**: Click on "Research" in the navigation menu
2. **Enter Topic**: Type your research topic in the input field (e.g., "Quantum Computing")
3. **Generate**: Click "Generate Paper" button
4. **Wait**: The AI will generate a comprehensive research paper in 10-30 seconds
5. **Download**: Choose your preferred format:
   - Click "Download PDF" for a professional PDF document
   - Click "Download DOCX" for an editable Word document
   - Click "Download Markdown" for a README-ready file

### Running Tests

Execute the test suite to ensure code quality:

```bash
# Run all tests
npm test

# Run tests in watch mode (during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

The test suite includes:
- Unit tests for components
- Integration tests for AI functionality
- Export functionality tests

---

## 🐛 Issue Reporting & Support

If you encounter any issues with scanning accuracy or camera access:

1.  Check your browser permissions for **Cameras**.
2.  Ensure good lighting (RGB sensors require adequate lux).
3.  Open an issue on the [GitHub Repository](https://github.com/parmarjh/AI-Concard-scaner/issues).

---

## 📜 Citation

If you use this project or its methodology, please cite:

```bibtex
@software{ai_concard_scanner,
  author = {Parmar, J.H.},
  title = {AI Concard Scanner: Multi-modal Business Card Intelligence},
  year = {2025},
  url = {https://github.com/parmarjh/AI-Concard-scaner}
}
```

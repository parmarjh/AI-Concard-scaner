
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

### ⚡ Core Capabilities
- **Real-time OCR & Extraction**: powered by **Google Gemini 2.5 Flash**.
- **Barcode & QR Scanner**: Integrated scanning for vCard QR codes with auto-parsing.
- **Auto Avatar Generation**: Creates unique 3D/Gradient avatars or fetches AI-generated personas for contacts without photos.
- **Smart Contact Management**: Search, sort, favorite, and organize contacts efficiently.

### 💾 Export & Sharing
- **Universal vCard (.vcf) Export**: Compatible with iOS, Android, and Outlook.
- **Web Share API**: Native mobile sharing integration.
- **Multi-format Support**: Export data to CSV, JSON, or Excel.

---

## 🎥 Demo Videos

### Watch AI Concard Scanner in Action
*(Click thumbnails to play)*

| Mobile Scanning | Handwritten Detection | 3D Avatar Generation |
|:---:|:---:|:---:|
| [![Mobile Scanning](https://via.placeholder.com/200x120?text=Mobile+Scan)](https://example.com) | [![Handwritten](https://via.placeholder.com/200x120?text=Handwritten+AI)](https://example.com) | [![Avatars](https://via.placeholder.com/200x120?text=Avatar+Gen)](https://example.com) |

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

### 3. **Data Structuring** 🧬
Raw inference is mapped to a strict **JSON Schema**:
```json
{
  "name": "Jane Doe",
  "title": "Senior Engineer",
  "company": "Tech Corp",
  "email": ["jane@techcorp.com"],
  "phone": ["+1-555-0123"]
}
```

---

## 🏗️ Repository Structure

```tree
AI-visiting-card-scaner/
├── components/           # UI Components (React)
│   ├── AddCardModal.tsx  # Core AI Integration
│   ├── BarcodeScanner.tsx# QR/Barcode Logic
│   └── ...
├── utils/                # Helper Algorithms
│   ├── avatarGenerator.ts# Avatar Gen Logic
│   └── contactSaver.ts   # vCard/Export Logic
├── pages/                # Route Pages
├── locales/              # i18n JSON files
├── types.ts              # TypeScript Interfaces
├── firebaseConfig.ts     # Auth Configuration
└── vite.config.ts        # Build Configuration
```

---

## 💻 Tech Stack & Technology Use

- **Frontend Framework**: React 19, TypeScript, TailwindCSS
- **Build Tool**: Vite (Optimized for speed)
- **AI Core**: Google Gemini API (`gemini-2.5-flash-preview`)
- **Computer Vision**: @zxing/library (Local QR), Gemini Vision (Cloud OCR)
- **Avatar Engine**: DiceBear API (HTTP-based generation)
- **Database/Auth**: Firebase (Cloud Firestore & Authentication)
- **PWA**: Service Workers with offline caching strategies

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
    - Setup `firebaseConfig.ts`.

3.  **Run Development Server**:
    ```bash
    npm run dev
    # Access via Network URL for Mobile Testing (e.g., http://192.168.x.x:3000)
    ```

### Evaluation Strategy
- **Accuracy Test**: Upload diverse card samples (glossy, matte, handwritten).
- **Latency Test**: Measure time-to-first-token (TTFT) for extraction.
- **Mobile Responsiveness**: Verify PWA installability and camera access on iOS/Android.

---

## 🐛 Issue Reporting & Support

If you encounter any issues with scanning accuracy or camera access:

1.  Check your browser permissions for **Cameras**.
2.  Ensure good lighting (RGB sensors require adequate lux).
3.  Open an issue on the [GitHub Repository](https://github.com/parmarjh/AI-visiting-card-scaner/issues).

---

## 📜 Citation

If you use this project or its methodology, please cite:

```bibtex
@software{ai_concard_scanner,
  author = {Parmar, J.H.},
  title = {AI Concard Scanner: Multi-modal Business Card Intelligence},
  year = {2025},
  url = {https://github.com/parmarjh/AI-visiting-card-scaner}
}
```

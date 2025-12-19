
import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { BrowserMultiFormatReader } from '@zxing/library';
import { Contact, OCRResult } from '../types';
import { UploadIcon, ScanIcon, SpinnerIcon, CloseIcon, UserIcon, EditIcon, FileTextIcon, ImageFileIcon, CameraIcon, QrCodeIcon } from './icons';

// pdf.js worker setup
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contacts: Contact | Contact[]) => void;
  initialContact?: Contact | null;
}

interface CardFormData {
  name?: string;
  title?: string;
  company?: string;
  phone?: string; // Comma-separated string
  email?: string; // Comma-separated string
  address?: string;
  website?: string;
  notes?: string;
}

type UploadMode = 'image' | 'file';

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSave, initialContact }) => {
  const { t } = useTranslation();
  const [uploadMode, setUploadMode] = useState<UploadMode>('image');
  const [step, setStep] = useState(1); // 1: Upload/Select, 2: Review
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocumentFiles, setSelectedDocumentFiles] = useState<File[]>([]);
  const [extractedData, setExtractedData] = useState<Partial<OCRResult>>({});
  const [bulkContacts, setBulkContacts] = useState<Contact[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScanningQR, setIsScanningQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({});

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (initialContact) {
      setFormData({
        name: initialContact.name,
        title: initialContact.title,
        company: initialContact.company,
        phone: initialContact.phone?.join(', '),
        email: initialContact.email?.join(', '),
        address: initialContact.address,
        website: initialContact.website,
        notes: initialContact.notes,
      });
      setPreviewUrl(initialContact.cardImageUrl || null);
      setStep(2);
    } else {
      setStep(1);
      setFormData({});
      setPreviewUrl(null);
    }
  }, [initialContact]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const closeCamera = useCallback(() => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setVideoStream(null);
    setIsCameraOpen(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [videoStream]);

  const resetState = useCallback(() => {
    setStep(1);
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedDocumentFiles([]);
    setBulkContacts([]);
    setExtractedData({});
    setIsProcessing(false);
    setError(null);
    setFormData({});
    closeCamera();
    setCameraError(null);
  }, [closeCamera]);

  useEffect(() => {
    // Cleanup stream on component unmount or when modal is closed
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // Fetch available video devices
  const getVideoDevices = async () => {
    try {
      // Ensure permissions are granted first by requesting a stream
      // This is often needed to get labels and full device list on first run
      const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
      initialStream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);

      if (videoDevices.length > 0 && !selectedDeviceId) {
        // Default to the first one if not set, or prefer 'environment' if we could detect it (complex without labels sometimes)
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.error("Error enumerating devices:", err);
      // Continue without list if failing, openCamera fallback will handle it
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCameraError(null);
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedDocumentFiles([]); // Clear other file type
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setPreviewUrl(null);
    }
  };

  const handleDocumentFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setCameraError(null);
    const files = event.target.files ? Array.from(event.target.files) as File[] : [];
    if (files.length > 0) {
      const validFiles = files.filter((file: File) => {
        const name = file.name.toLowerCase();
        return name.endsWith('.csv') || name.endsWith('.pdf') || file.type === 'text/csv' || file.type === 'application/pdf';
      });

      if (validFiles.length > 0) {
        setSelectedDocumentFiles(validFiles);
        setSelectedImage(null); // Clear other file type
        setPreviewUrl(null); // Clear image preview
      } else {
        setError(t('addCardModal.errorUnsupportedFile'));
      }
    } else {
      setSelectedDocumentFiles([]);
    }
  };

  const processAndDisplayParsedData = (parsedResult: Partial<OCRResult>, sourceFilename?: string) => {
    setExtractedData(parsedResult);
    const initialFormData: CardFormData = {
      name: parsedResult.name || '',
      title: parsedResult.title || '',
      company: parsedResult.company || '',
      phone: (parsedResult.phone && parsedResult.phone.length > 0) ? parsedResult.phone.join(', ') : '',
      email: (parsedResult.email && parsedResult.email.length > 0) ? parsedResult.email.join(', ') : '',
      address: parsedResult.address || '',
      website: parsedResult.website || '',
      notes: [parsedResult.notes, sourceFilename ? `Source: ${sourceFilename}` : ''].filter(Boolean).join('\n'),
    };
    setFormData(initialFormData);
    setStep(2);
  };

  const removeBulkContact = (index: number) => {
    setBulkContacts(prev => prev.filter((_, i) => i !== index));
  };

  const parseVCard = (vcard: string): Partial<OCRResult> => {
    const result: Partial<OCRResult> = {};
    const lines = vcard.split(/\r?\n/);
    lines.forEach(line => {
      if (line.startsWith('FN:') || line.startsWith('NAME:')) result.name = line.substring(line.indexOf(':') + 1).trim();
      if (line.startsWith('ORG:')) result.company = line.substring(line.indexOf(':') + 1).trim();
      if (line.startsWith('TITLE:')) result.title = line.substring(line.indexOf(':') + 1).trim();
      if (line.startsWith('TEL')) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val) result.phone = [...(result.phone || []), val];
      }
      if (line.startsWith('EMAIL')) {
        const val = line.substring(line.indexOf(':') + 1).trim();
        if (val) result.email = [...(result.email || []), val];
      }
      if (line.startsWith('ADR:')) result.address = line.substring(line.indexOf(':') + 1).replace(/;/g, ' ').trim();
      if (line.startsWith('URL:')) result.website = line.substring(line.indexOf(':') + 1).trim();
      if (line.startsWith('NOTE:')) result.notes = line.substring(line.indexOf(':') + 1).trim();
    });
    return result;
  };

  const startQrScanner = async () => {
    if (!videoRef.current) return;
    setIsScanningQR(true);
    const codeReader = new BrowserMultiFormatReader();
    try {
      const result = await codeReader.decodeFromVideoElement(videoRef.current);
      if (result) {
        const text = result.getText();
        let parsed: Partial<OCRResult> = {};
        if (text.includes('BEGIN:VCARD')) {
          parsed = parseVCard(text);
        } else {
          parsed = { notes: `Scanned Code: ${text}` };
          if (text.includes('@') && !text.includes(' ')) parsed.email = [text];
          else if (/^\+?[\d\s-]{7,}$/.test(text)) parsed.phone = [text];
          else if (text.startsWith('http')) parsed.website = text;
        }
        processAndDisplayParsedData(parsed, 'QR/Barcode Scan');
        setIsScanningQR(false);
        codeReader.reset();
        closeCamera();
      }
    } catch (err) {
      if (isScanningQR) {
        console.log("QR Scan attempt finished or failed.");
      }
    }
  };

  const handleScanImage = async () => {
    if (!navigator.onLine) {
      setError(t('addCardModal.errorOffline'));
      return;
    }
    if (!selectedImage && !previewUrl) { // Check previewUrl too for camera capture case
      setError(t('addCardModal.errorNoImage'));
      return;
    }
    if (!process.env.API_KEY) {
      setError(t('addCardModal.errorApiKey'));
      console.error("Gemini API Key (process.env.API_KEY) is missing.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const genAI = new GoogleGenerativeAI(process.env.API_KEY);
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // Corrected model
        generationConfig: {
          responseMimeType: "application/json"
        }
      });

      // Ensure previewUrl is used for base64 data, as selectedImage might be null after camera capture if not explicitly re-set
      const base64Image = previewUrl!.split(',')[1];
      const mimeType = previewUrl!.substring(previewUrl!.indexOf(':') + 1, previewUrl!.indexOf(';'));


      const imagePart = {
        inlineData: { mimeType: selectedImage?.type || mimeType, data: base64Image },
      };
      const prompt = `Carefully transcribe ALL text from this business card and organize into JSON.
             - Decipher handwriting if present.
             - Organize as: {name, title, company, phone:[], email:[], address, website, notes}.
             - For fields not found, use "".
             - If you see a logo with a company name, extract it.
             - Look for social media links and put them in notes.
             - Output MUST be valid JSON.`;

      const result = await model.generateContent([imagePart, prompt]);
      const response = await result.response;

      let jsonStr = response.text().trim();

      // Basic cleanup if model didn't respect JSON mode perfectly (rare with 2.0-flash but possible)
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) jsonStr = match[2].trim();

      const parsedResult: OCRResult = JSON.parse(jsonStr);
      processAndDisplayParsedData(parsedResult, selectedImage?.name || 'camera_capture.jpg');
    } catch (err: any) {
      console.error("Error scanning image:", err);
      const errorMessage = err.message || '';
      if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('PERMISSION_DENIED')) {
        setError(t('addCardModal.errorApiKeyIssue'));
      } else {
        setError(t('addCardModal.errorScanFailed', { message: errorMessage }));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseDocument = async () => {
    if (!navigator.onLine) {
      setError(t('addCardModal.errorOffline'));
      return;
    }
    if (selectedDocumentFiles.length === 0) {
      setError(t('addCardModal.errorNoDocument'));
      return;
    }
    setIsProcessing(true);
    setError(null);

    const allExtractedContacts: Contact[] = [];

    try {
      for (const file of selectedDocumentFiles) {
        const name = file.name.toLowerCase();
        const isCsv = name.endsWith('.csv') || file.type === 'text/csv';
        const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';

        if (isCsv) {
          await new Promise<void>((resolve, reject) => {
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              transformHeader: (h) => h.toLowerCase().trim().replace(/[^a-z0-9]/g, ''),
              complete: (results) => {
                results.data.forEach((row: any) => {
                  const findField = (keys: string[]) => {
                    for (const k of keys) {
                      if (row[k]) return row[k];
                      const matchedKey = Object.keys(row).find(h => h.includes(k));
                      if (matchedKey && row[matchedKey]) return row[matchedKey];
                    }
                    return '';
                  };

                  let contactName = findField(['name', 'fullname', 'displayname', 'person', 'contactperson', 'entryname']);
                  if (!contactName) {
                    const first = findField(['given', 'first', 'fname']);
                    const last = findField(['family', 'last', 'lname']);
                    contactName = [first, last].filter(Boolean).join(' ');
                  }

                  if (contactName) {
                    allExtractedContacts.push({
                      id: crypto.randomUUID(),
                      name: contactName,
                      title: findField(['title', 'job', 'position', 'role', 'designation']),
                      company: findField(['company', 'organization', 'firm', 'business', 'org']),
                      phone: (findField(['phone', 'mobile', 'tel', 'cell', 'mob']) || '').toString().split(/[;,]/).map((p: any) => p.trim()).filter(Boolean),
                      email: (findField(['email', 'mail', 'mailbox', 'emailid']) || '').toString().split(/[;,]/).map((e: any) => e.trim()).filter(Boolean),
                      address: findField(['address', 'location', 'street', 'city', 'addr', 'loc']),
                      website: findField(['website', 'url', 'site', 'web', 'www']),
                      notes: findField(['notes', 'comments', 'desc', 'info', 'remarks']) || `Source: ${file.name}`,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                    });
                  }
                });
                resolve();
              },
              error: (err) => reject(err)
            });
          });
        } else if (isPdf) {
          // Simplified PDF extraction, one contact per file for now through AI
          if (!process.env.API_KEY) {
            setError(t('addCardModal.errorApiKey'));
            console.error("Gemini API Key (process.env.API_KEY) is missing.");
            setIsProcessing(false);
            return;
          }
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
          }

          if (fullText.trim()) {
            const genAI = new GoogleGenerativeAI(process.env.API_KEY!);
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: "application/json" } });
            const prompt = `Extract contact information from this text. Return strictly JSON: {'name', 'title', 'company', 'phone'[], 'email'[], 'address', 'website', 'notes'}. Text: \n${fullText}`;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const data: OCRResult = JSON.parse(response.text().trim().replace(/^```json/, '').replace(/```$/, ''));
            if (data.name) {
              allExtractedContacts.push({
                ...data,
                id: crypto.randomUUID(),
                name: data.name!,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              } as Contact);
            }
          }
        }
      }

      if (allExtractedContacts.length === 1 && !selectedDocumentFiles.some(f => f.name.toLowerCase().endsWith('.csv'))) {
        processAndDisplayParsedData(allExtractedContacts[0], selectedDocumentFiles[0].name);
      } else if (allExtractedContacts.length > 0) {
        setBulkContacts(allExtractedContacts);
        setStep(2);
      } else {
        setError(t('addCardModal.errorNoDataFound'));
      }
    } catch (err: any) {
      console.error("Error processing documents:", err);
      setError(t('addCardModal.errorDocProcess', { message: err.message || '' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = () => {
    if (bulkContacts.length > 0) {
      onSave(bulkContacts);
    } else {
      if (!formData.name) {
        setError(t('addCardModal.errorNameRequired'));
        return;
      }
      const currentPreviewUrl = (uploadMode === 'image' || isCameraOpen || selectedImage) ? previewUrl : undefined;

      const newContact: Contact = {
        id: initialContact?.id || crypto.randomUUID(),
        name: formData.name || '',
        title: formData.title,
        company: formData.company,
        phone: formData.phone ? formData.phone.split(',').map(p => p.trim()).filter(Boolean) : undefined,
        email: formData.email ? formData.email.split(',').map(e => e.trim()).filter(Boolean) : undefined,
        address: formData.address,
        website: formData.website,
        notes: formData.notes,
        cardImageUrl: currentPreviewUrl || undefined,
        isFavorite: initialContact?.isFavorite || false,
        createdAt: initialContact?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onSave(newContact);
    }
    handleClose();
  };

  // Open camera with specific device ID if available
  const openCamera = async () => {
    setCameraError(null);
    setError(null);
    setSelectedImage(null); // Clear any selected file
    setPreviewUrl(null);    // Clear any file preview

    // First, verify we have device list
    if (availableDevices.length === 0) {
      await getVideoDevices();
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Construct constraints based on selection
        const constraints: MediaStreamConstraints = {
          video: selectedDeviceId
            ? { deviceId: { exact: selectedDeviceId } }
            : { facingMode: "environment" } // Fallback to environment preference
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setVideoStream(stream);

        // Wait for video element to be ready
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 100);

        setIsCameraOpen(true);
      } catch (err: any) {
        console.error("Error accessing camera:", err);
        // Fallback retry with basic constraints if the specific one failed
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          setVideoStream(stream);
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          }, 100);
          setIsCameraOpen(true);
        } catch (fallbackErr: any) {
          console.error("Error accessing camera (fallback):", fallbackErr);
          setCameraError(t('addCardModal.errorCameraAccess', { errorName: fallbackErr.name || 'Unknown Error' }));
          setIsCameraOpen(false);
        }
      }
    } else {
      if (!window.isSecureContext) {
        setCameraError(t('addCardModal.errorInsecureContext'));
      } else {
        setCameraError(t('addCardModal.errorCameraSupport'));
      }
      setIsCameraOpen(false);
    }
  };

  const handleCameraChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const newDeviceId = e.target.value;
    setSelectedDeviceId(newDeviceId);
    // If camera is already open, restart it with new device
    if (isCameraOpen) {
      closeCamera();
      setTimeout(() => openCamera(), 100);
    }
  };

  const capturePhoto = async () => {
    setCameraError(null);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Ensure video dimensions are available
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setCameraError("Camera not ready yet. Please wait a moment.");
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);

        // Convert data URL to File object
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
          setSelectedImage(file); // Set this for handleScanImage if it relies on File object properties like .name or .type
        } catch (e) {
          console.error("Error converting camera capture to file:", e);
          // Fallback: selectedImage might remain null, but previewUrl is set.
          // handleScanImage should be robust enough or primarily use previewUrl for image data.
        }
      }
      closeCamera(); // Close camera stream after capture
    } else {
      setCameraError(t('addCardModal.errorCaptureFailed'));
    }
  };

  // Start device enumeration once
  useEffect(() => {
    if (isOpen) {
      getVideoDevices();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentActionLabel = uploadMode === 'image' ? t('addCardModal.scanWithAI') : t('addCardModal.parseDocument');
  const currentProcessingLabel = uploadMode === 'image' ? t('addCardModal.scanning') : t('addCardModal.parsing');


  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addCardModalTitle"
    >
      <div className="glass-dark border border-white/10 rounded-[40px] shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-zoomIn">
        <header className="flex items-center justify-between p-8 border-b border-white/5">
          <div>
            <h2 id="addCardModalTitle" className="text-3xl font-black text-white tracking-tight">
              {initialContact ? t('addCardModal.titleEdit') : (step === 1 ? t('addCardModal.titleStep1') : (bulkContacts.length > 0 ? t('addCardModal.bulkReview') : t('addCardModal.titleStep2')))}
            </h2>
            <p className="text-indigo-300/60 text-sm font-bold uppercase tracking-widest mt-1">
              {initialContact ? t('addCardModal.subtitleEdit') : (step === 1 ? 'Source Acquisition' : (bulkContacts.length > 0 ? t('addCardModal.contactsFound', { count: bulkContacts.length }) : 'Information Review'))}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-2xl transition-all"
            aria-label={t('addCardModal.close')}
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="flex bg-white/5 p-1.5 rounded-3xl border border-white/5">
              {(['image', 'file'] as UploadMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setUploadMode(mode); setError(null); setCameraError(null); setSelectedImage(null); setSelectedDocumentFiles([]); setPreviewUrl(null); closeCamera(); }}
                  className={`flex-1 py-4 px-6 rounded-[22px] text-sm font-black transition-all duration-300 flex items-center justify-center gap-3
                    ${uploadMode === mode ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {mode === 'image' ? <ImageFileIcon className="w-5 h-5" /> : <FileTextIcon className="w-5 h-5" />}
                  {mode === 'image' ? t('addCardModal.scanImage') : t('addCardModal.uploadDocument')}
                </button>
              ))}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden"></canvas>

          {error && (
            <div className="p-5 bg-red-400/10 border border-red-400/20 text-red-400 rounded-3xl text-sm font-bold flex items-center animate-shake">
              <span className="mr-3 text-xl">⚠️</span> {error}
            </div>
          )}
          {cameraError && step === 1 && uploadMode === 'image' && (
            <div className="p-5 bg-amber-400/10 border border-amber-400/20 text-amber-400 rounded-3xl text-sm font-bold flex items-center">
              <span className="mr-3 text-xl">💡</span> {cameraError}
            </div>
          )}

          {step === 1 && uploadMode === 'image' && (
            <>
              {!isCameraOpen && !previewUrl && (
                <div className="flex flex-col gap-6">
                  <button
                    onClick={openCamera}
                    className="group relative flex flex-col items-center justify-center p-12 bg-indigo-600/10 hover:bg-indigo-600/20 border-2 border-dashed border-indigo-500/30 rounded-[40px] transition-all overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-20 h-20 bg-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl transform group-hover:scale-110 transition-transform">
                      <CameraIcon className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-xl font-black text-indigo-400">{t('addCardModal.openCamera')}</span>
                    <p className="text-indigo-400/50 text-sm mt-2 font-medium">Capture photo directly from camera</p>
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-500">
                      <span className="bg-slate-900 px-4">OR</span>
                    </div>
                  </div>

                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex items-center justify-center p-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-3xl transition-all">
                      <UploadIcon className="w-6 h-6 text-indigo-400 mr-4" />
                      <span className="text-slate-300 font-bold">{t('addCardModal.uploadImage')}</span>
                    </div>
                  </div>
                </div>
              )}

              {isCameraOpen && (
                <div className="relative rounded-[40px] overflow-hidden bg-black shadow-2xl border border-white/10 animate-fadeIn">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-auto aspect-video object-cover"
                  ></video>

                  <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 px-6">
                    {availableDevices.length > 1 && (
                      <select
                        onChange={handleCameraChange}
                        value={selectedDeviceId || ''}
                        className="bg-black/60 backdrop-blur-md text-white text-xs font-black p-3 rounded-2xl border border-white/20 outline-none"
                      >
                        {availableDevices.map(device => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.substring(0, 4)}`}
                          </option>
                        ))}
                      </select>
                    )}

                    <button
                      onClick={capturePhoto}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transform active:scale-90 transition-all border-[6px] border-indigo-500"
                    >
                      <div className="w-14 h-14 bg-white rounded-full border-2 border-slate-200"></div>
                    </button>

                    <button
                      type="button"
                      onClick={() => isScanningQR ? setIsScanningQR(false) : startQrScanner()}
                      className={`p-4 rounded-3xl border transition-all flex flex-col items-center gap-1 ${isScanningQR ? 'bg-emerald-500/20 text-emerald-400 border-emerald-400/20' : 'bg-white/5 text-slate-400 border-white/10'}`}
                    >
                      <QrCodeIcon className={`w-6 h-6 ${isScanningQR ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{isScanningQR ? 'SCANNING' : 'QR SCAN'}</span>
                    </button>

                    <button
                      onClick={closeCamera}
                      className="p-4 bg-red-500/20 text-red-400 rounded-2xl border border-red-400/20 hover:bg-red-500/30 transition-all font-black"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {previewUrl && !isCameraOpen && (
                <div className="relative group rounded-[40px] overflow-hidden shadow-2xl border border-white/10">
                  <img src={previewUrl} alt="Preview" className="w-full h-auto object-cover max-h-[300px]" />
                  <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button
                      onClick={() => { setPreviewUrl(null); setSelectedImage(null); }}
                      className="p-4 bg-red-500 text-white rounded-2xl shadow-xl hover:scale-110 transition-all font-black"
                    >
                      Delete
                    </button>
                    <button
                      onClick={openCamera}
                      className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-all font-black"
                    >
                      Retake
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 1 && uploadMode === 'file' && (
            <div className="flex flex-col gap-6">
              <div className="relative group">
                <input
                  type="file"
                  multiple
                  accept=".csv,.pdf,text/csv,application/pdf"
                  onChange={handleDocumentFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center p-16 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 rounded-[40px] transition-all">
                  <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                    <UploadIcon className="w-10 h-10 text-emerald-500" />
                  </div>
                  <span className="text-xl font-black text-white">{selectedDocumentFiles.length > 0 ? `${selectedDocumentFiles.length} files selected` : t('addCardModal.clickToUpload')}</span>
                  {selectedDocumentFiles.length > 0 && (
                    <div className="mt-2 text-slate-500 text-sm font-medium text-center">
                      {selectedDocumentFiles.map(f => f.name).join(', ')}
                    </div>
                  )}
                  <p className="text-slate-500 text-sm mt-3 font-medium">Supports PDF or CSV files</p>
                </div>
              </div>
            </div>
          )}

          {step === 2 && bulkContacts.length > 0 && (
            <div className="space-y-3">
              {bulkContacts.map((contact, index) => (
                <div key={index} className="group p-4 bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 rounded-3xl flex items-center gap-4 transition-all">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center font-black text-indigo-400 text-xl shadow-inner">
                    {contact.name ? contact.name[0].toUpperCase() : '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-black truncate">{contact.name || 'Unnamed Contact'}</div>
                    <div className="text-slate-500 text-xs font-bold truncate">
                      {contact.title ? `${contact.title} @ ` : ''}{contact.company || 'Private Entity'}
                    </div>
                  </div>
                  <button
                    onClick={() => removeBulkContact(index)}
                    className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove Contact"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <p className="text-center text-slate-500 text-sm font-bold mt-4 animate-pulse">
                Review and remove any duplicates before importing
              </p>
            </div>
          )}

          {step === 2 && bulkContacts.length === 0 && (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
              {previewUrl && (
                <div className="col-span-full mb-6">
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-lg group">
                    <img src={previewUrl} alt="Card" className="w-full h-48 object-cover opacity-60" />
                    <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/20 backdrop-blur-[2px]">
                      <span className="text-white font-black uppercase tracking-tighter text-3xl opacity-30">AI EXTRACTED</span>
                    </div>
                  </div>
                </div>
              )}

              {(Object.keys(formData) as Array<keyof CardFormData>)
                .filter(key => key !== 'notes')
                .map((key) => {
                  const label = t(`addCardModal.form.${key}`);
                  return (
                    <div key={key} className="space-y-2">
                      <label htmlFor={key} className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                        {label}
                      </label>
                      <div className="relative group">
                        <input
                          type="text"
                          name={key}
                          id={key}
                          value={formData[key] || ''}
                          onChange={handleFormChange}
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-white/10"
                          placeholder={t('addCardModal.form.enterPlaceholder', { field: label.toLowerCase() })}
                        />
                      </div>
                    </div>
                  );
                })}

              <div className="col-span-full space-y-2">
                <label htmlFor="notes" className="block text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  {t('addCardModal.form.notes')}
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={handleFormChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-600 group-hover:bg-white/10"
                  placeholder={t('addCardModal.form.enterPlaceholder', { field: t('addCardModal.form.notes').toLowerCase() })}
                />
              </div>
            </form>
          )}
        </main>

        <footer className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-8 py-4 text-slate-400 hover:text-white font-bold rounded-2xl border border-white/10 hover:bg-white/5 transition-all"
          >
            {t('addCardModal.cancel')}
          </button>

          {step === 1 && (
            <button
              type="button"
              onClick={uploadMode === 'image' ? handleScanImage : handleParseDocument}
              disabled={
                isProcessing || isCameraOpen ||
                (uploadMode === 'image' && !selectedImage && !previewUrl) ||
                (uploadMode === 'file' && selectedDocumentFiles.length === 0)
              }
              className="w-full sm:w-auto flex items-center justify-center px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all disabled:opacity-30 disabled:translate-y-0 transform hover:-translate-y-1 active:scale-95"
            >
              {isProcessing ? (
                <SpinnerIcon className="w-6 h-6 mr-3 animate-spin" />
              ) : (
                uploadMode === 'image' ? <ScanIcon className="w-6 h-6 mr-3" /> : <FileTextIcon className="w-6 h-6 mr-3" />
              )}
              {isProcessing ? currentProcessingLabel : currentActionLabel}
            </button>
          )}

          {step === 2 && (
            <div className="flex w-full sm:w-auto gap-4">
              {!initialContact && (
                <button
                  type="button"
                  onClick={() => { setError(null); setCameraError(null); setStep(1); }}
                  className="flex-1 sm:flex-none px-6 py-4 bg-white/5 text-slate-300 font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  <EditIcon className="w-5 h-5 mr-3" />
                  {t('addCardModal.editRescan')}
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveContact}
                className="flex-1 sm:flex-none px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-[0_10px_30px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center transform hover:-translate-y-1 active:scale-95"
              >
                <UserIcon className="w-6 h-6 mr-3" />
                {bulkContacts.length > 0 ? t('addCardModal.importContacts', { count: bulkContacts.length }) : t('addCardModal.saveContact')}
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AddCardModal;

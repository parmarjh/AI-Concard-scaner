
import React, { useState, useCallback, ChangeEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import Papa from 'papaparse';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.min.mjs';
import { Contact, OCRResult } from '../types';
import { UploadIcon, ScanIcon, SpinnerIcon, CloseIcon, UserIcon, EditIcon, FileTextIcon, ImageFileIcon, CameraIcon } from './icons';

// pdf.js worker setup
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
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

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onSave }) => {
  const { t } = useTranslation();
  const [uploadMode, setUploadMode] = useState<UploadMode>('image');
  const [step, setStep] = useState(1); // 1: Upload/Select, 2: Review
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedDocumentFile, setSelectedDocumentFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<Partial<OCRResult>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CardFormData>({});

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const resetState = useCallback(() => {
    setStep(1);
    setSelectedImage(null);
    setPreviewUrl(null);
    setSelectedDocumentFile(null);
    setExtractedData({});
    setIsProcessing(false);
    setError(null);
    setFormData({});
    closeCamera(); // Ensure camera is closed
    setCameraError(null);
    // setUploadMode('image'); // Optionally reset mode, or keep user's last choice
  }, []); // Added closeCamera to dependency if it's defined outside or memoized

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


  useEffect(() => {
    // Cleanup stream on component unmount or when modal is closed
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);


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
      setSelectedDocumentFile(null); // Clear other file type
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
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.type === 'application/pdf') {
        setSelectedDocumentFile(file);
        setSelectedImage(null); // Clear other file type
        setPreviewUrl(null); // Clear image preview
      } else {
        setError(t('addCardModal.errorUnsupportedFile'));
        setSelectedDocumentFile(null);
      }
    } else {
      setSelectedDocumentFile(null);
    }
  };
  
  const processAndDisplayParsedData = (parsedResult: Partial<OCRResult>, sourceFilename?: string) => {
    setExtractedData(parsedResult);
    const initialFormData: CardFormData = {
      name: parsedResult.name,
      title: parsedResult.title,
      company: parsedResult.company,
      phone: parsedResult.phone ? parsedResult.phone.join(', ') : '',
      email: parsedResult.email ? parsedResult.email.join(', ') : '',
      address: parsedResult.address,
      website: parsedResult.website,
      notes: parsedResult.notes || (sourceFilename ? `Source: ${sourceFilename}` : ''),
    };
    setFormData(initialFormData);
    setStep(2);
    // Preview URL is already set if it's from camera or file upload
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Ensure previewUrl is used for base64 data, as selectedImage might be null after camera capture if not explicitly re-set
      const base64Image = previewUrl!.split(',')[1];
      const mimeType = previewUrl!.substring(previewUrl!.indexOf(':') + 1, previewUrl!.indexOf(';'));


      const imagePart = {
        inlineData: { mimeType: selectedImage?.type || mimeType , data: base64Image },
      };
      const textPart = {
        text: `Analyze this business card image and extract contact information. 
               Provide output as JSON: {'name' (string), 'title' (string), 'company' (string), 
               'phone' (array of strings), 'email' (array of strings), 
               'address' (string), 'website' (string), 'notes' (string)}. 
               Omit fields not found. Focus on accuracy.`,
      };
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-04-17',
        contents: { parts: [imagePart, textPart] },
        config: { responseMimeType: "application/json" }
      });

      let jsonStr = response.text.trim();
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
    if (!selectedDocumentFile) {
      setError(t('addCardModal.errorNoDocument'));
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      if (selectedDocumentFile.type === 'text/csv') {
        Papa.parse(selectedDocumentFile, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.error("CSV Parsing errors:", results.errors);
              setError(t('addCardModal.errorCsvParse', { message: results.errors[0].message }));
              setIsProcessing(false);
              return;
            }
            if (results.data.length === 0) {
              setError(t('addCardModal.errorCsvEmpty'));
              setIsProcessing(false);
              return;
            }
            const firstRow = results.data[0] as any;
            // Basic mapping - can be made more sophisticated
            const mappedData: Partial<OCRResult> = {
              name: firstRow.Name || firstRow.name || firstRow["Full Name"],
              title: firstRow.Title || firstRow.title,
              company: firstRow.Company || firstRow.company,
              phone: firstRow.Phone || firstRow.phone ? String(firstRow.Phone || firstRow.phone).split(',').map(p => p.trim()) : [],
              email: firstRow.Email || firstRow.email ? String(firstRow.Email || firstRow.email).split(',').map(e => e.trim()) : [],
              address: firstRow.Address || firstRow.address,
              website: firstRow.Website || firstRow.website || firstRow.URL,
              notes: firstRow.Notes || firstRow.notes,
            };
            if (results.data.length > 1) {
              console.warn(`CSV contains multiple contacts (${results.data.length} rows). Processing the first one.`);
            }
            processAndDisplayParsedData(mappedData, selectedDocumentFile.name);
            setIsProcessing(false);
          },
          error: (error: any) => {
            console.error("Error parsing CSV:", error);
            setError(t('addCardModal.errorCsvParse', { message: error.message }));
            setIsProcessing(false);
          }
        });
      } else if (selectedDocumentFile.type === 'application/pdf') {
        if (!process.env.API_KEY) {
          setError(t('addCardModal.errorApiKey'));
          console.error("Gemini API Key (process.env.API_KEY) is missing.");
          setIsProcessing(false);
          return;
        }
        const arrayBuffer = await selectedDocumentFile.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }

        if (!fullText.trim()) {
            setError(t('addCardModal.errorPdfText'));
            setIsProcessing(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const textPart = {
          text: `Extract contact information from the following text, which was extracted from a document.
                 Provide output as JSON: {'name' (string), 'title' (string), 'company' (string), 
                 'phone' (array of strings), 'email' (array of strings), 
                 'address' (string), 'website' (string), 'notes' (string)}. 
                 If a field is not found, omit it or return an empty string/array. Be concise.
                 Text: \n${fullText}`,
        };
        
        const response: GenerateContentResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-preview-04-17',
          contents: { parts: [textPart] },
          config: { responseMimeType: "application/json" }
        });

        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) jsonStr = match[2].trim();
        
        const parsedResult: OCRResult = JSON.parse(jsonStr);
        processAndDisplayParsedData(parsedResult, selectedDocumentFile.name);
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error("Error processing document:", err);
      setError(t('addCardModal.errorDocProcess', { message: err.message || '' }));
      setIsProcessing(false);
    }
  };
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveContact = () => {
    if (!formData.name) {
      setError(t('addCardModal.errorNameRequired'));
      return;
    }
    const currentPreviewUrl = (uploadMode === 'image' || isCameraOpen || selectedImage) ? previewUrl : undefined;

    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: formData.name || '',
      title: formData.title,
      company: formData.company,
      phone: formData.phone ? formData.phone.split(',').map(p => p.trim()).filter(p => p) : undefined,
      email: formData.email ? formData.email.split(',').map(e => e.trim()).filter(e => e) : undefined,
      address: formData.address,
      website: formData.website,
      notes: formData.notes,
      cardImageUrl: currentPreviewUrl,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(newContact);
    handleClose();
  };

  const openCamera = async () => {
    setCameraError(null);
    setError(null);
    setSelectedImage(null); // Clear any selected file
    setPreviewUrl(null);    // Clear any file preview

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOpen(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        // Fallback if environment facingMode fails or other error
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setVideoStream(stream);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
        } catch (fallbackErr: any) {
            console.error("Error accessing camera (fallback):", fallbackErr);
            setCameraError(t('addCardModal.errorCameraAccess', {errorName: fallbackErr.name}));
            setIsCameraOpen(false);
        }
      }
    } else {
      setCameraError(t('addCardModal.errorCameraSupport'));
      setIsCameraOpen(false);
    }
  };

  const capturePhoto = async () => {
    setCameraError(null);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
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


  if (!isOpen) return null;
  
  const currentActionLabel = uploadMode === 'image' ? t('addCardModal.scanWithAI') : t('addCardModal.parseDocument');
  const currentProcessingLabel = uploadMode === 'image' ? t('addCardModal.scanning') : t('addCardModal.parsing');


  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addCardModalTitle"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-200">
          <h2 id="addCardModalTitle" className="text-xl sm:text-2xl font-semibold text-primary">
            {step === 1 ? t('addCardModal.titleStep1') : t('addCardModal.titleStep2')}
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral hover:text-red-500 transition-colors"
            aria-label={t('addCardModal.close')}
          >
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>

        <main className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {step === 1 && (
            <div className="mb-4 flex border border-neutral-300 rounded-lg p-1 bg-neutral-light/50">
              {(['image', 'file'] as UploadMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setUploadMode(mode); setError(null); setCameraError(null); setSelectedImage(null); setSelectedDocumentFile(null); setPreviewUrl(null); closeCamera();}}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out flex items-center justify-center gap-2
                    ${uploadMode === mode ? 'bg-primary text-white shadow' : 'text-neutral-dark hover:bg-neutral-200'}`}
                >
                  {mode === 'image' ? <ImageFileIcon className="w-5 h-5"/> : <FileTextIcon className="w-5 h-5"/>}
                  {mode === 'image' ? t('addCardModal.scanImage') : t('addCardModal.uploadDocument')}
                </button>
              ))}
            </div>
          )}
          
          <canvas ref={canvasRef} className="hidden"></canvas> {/* Hidden canvas for image capture */}

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm" role="alert">
              <p className="font-bold">{t('addCardModal.errorTitle')}</p>
              <p>{error}</p>
            </div>
          )}
           {cameraError && step === 1 && uploadMode === 'image' && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md text-sm" role="alert">
              <p className="font-bold">{t('addCardModal.cameraIssueTitle')}</p>
              <p>{cameraError}</p>
            </div>
          )}


          {step === 1 && uploadMode === 'image' && (
            <>
              {!isCameraOpen ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="cardImageUpload" className="block text-sm font-medium text-neutral-dark">
                      {t('addCardModal.uploadCardImage')}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-neutral" />
                        <div className="flex text-sm text-neutral-dark">
                          <label
                            htmlFor="cardImageUpload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                          >
                            <span>{t('addCardModal.uploadFile')}</span>
                            <input id="cardImageUpload" name="cardImageUpload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                          </label>
                          <p className="pl-1">{t('addCardModal.dragAndDrop')}</p>
                        </div>
                        <p className="text-xs text-neutral">{t('addCardModal.fileTypes')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                     <p className="text-sm text-neutral-dark mb-2">{t('addCardModal.useCameraPrompt')}</p>
                    <button
                        type="button"
                        onClick={openCamera}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                        <CameraIcon className="w-5 h-5 mr-2" /> {t('addCardModal.useCamera')}
                    </button>
                  </div>

                  {previewUrl && !selectedImage?.name.startsWith('camera_capture') && ( // Show preview if it's from file upload
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-neutral-dark mb-1">{t('addCardModal.imagePreview')}</h3>
                      <img src={previewUrl} alt="Card preview" className="rounded-lg shadow-md max-h-48 w-auto mx-auto border" />
                    </div>
                  )}
                </>
              ) : (
                // Camera View
                <div className="space-y-3">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted /* Muted is important for autoplay without user gesture */
                    className="w-full h-auto max-h-[300px] bg-neutral-dark rounded-md border border-neutral-300" 
                  />
                  <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-emerald-700 border border-transparent rounded-md shadow-sm"
                    >
                        <CameraIcon className="w-5 h-5 mr-2" /> {t('addCardModal.capturePhoto')}
                    </button>
                    <button
                        type="button"
                        onClick={closeCamera}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light hover:bg-neutral-200 border border-neutral-300 rounded-md shadow-sm"
                    >
                        {t('addCardModal.cancelCamera')}
                    </button>
                  </div>
                </div>
              )}
               {/* Show preview from camera capture after capture, before scan */}
              {previewUrl && selectedImage?.name.startsWith('camera_capture') && !isCameraOpen && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">{t('addCardModal.capturePreview')}</h3>
                  <img src={previewUrl} alt="Captured card preview" className="rounded-lg shadow-md max-h-48 w-auto mx-auto border" />
                </div>
              )}
            </>
          )}
          
          {step === 1 && uploadMode === 'file' && (
            <>
              <div className="space-y-2">
                <label htmlFor="documentFileUpload" className="block text-sm font-medium text-neutral-dark">
                  {t('addCardModal.uploadDocPrompt')}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-neutral" />
                    <div className="flex text-sm text-neutral-dark">
                      <label
                        htmlFor="documentFileUpload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-indigo-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                      >
                        <span>{t('addCardModal.selectFile')}</span>
                        <input id="documentFileUpload" name="documentFileUpload" type="file" className="sr-only" accept=".csv,.pdf" onChange={handleDocumentFileChange} />
                      </label>
                      <p className="pl-1">{t('addCardModal.dragAndDrop')}</p>
                    </div>
                    <p className="text-xs text-neutral">{t('addCardModal.docTypes')}</p>
                  </div>
                </div>
              </div>
              {selectedDocumentFile && (
                <div className="mt-4 p-3 bg-neutral-light rounded-md text-sm text-neutral-dark">
                  {t('addCardModal.selectedFile', { fileName: selectedDocumentFile.name, fileSize: Math.round(selectedDocumentFile.size / 1024) })}
                </div>
              )}
            </>
          )}

          {step === 2 && (
             <form className="space-y-3 sm:space-y-4">
              {previewUrl && ( // Show image preview in review step
                <div className="mb-3">
                  <h3 className="text-sm font-medium text-neutral-dark mb-1">{t('addCardModal.cardImage')}</h3>
                  <img src={previewUrl} alt="Card Scan Preview" className="rounded-lg shadow-md max-h-40 w-auto mx-auto border" />
                </div>
              )}
              {(Object.keys(formData) as Array<keyof CardFormData>).map((key) => {
                 const label = t(`addCardModal.form.${key}`);

                return (
                  <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-neutral-dark">
                      {label}
                    </label>
                    <input
                      type="text"
                      name={key}
                      id={key}
                      value={formData[key] || ''}
                      onChange={handleFormChange}
                      className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                      placeholder={t('addCardModal.form.enterPlaceholder', { field: label.toLowerCase() })}
                    />
                     {(key === 'phone' || key === 'email') && <p className="text-xs text-neutral mt-1">{t('addCardModal.form.commaSeparated')}</p>}
                  </div>
                );
              })}
               <div>
                <label htmlFor="notes" className="block text-sm font-medium text-neutral-dark">
                  {t('addCardModal.form.notes')}
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  value={formData.notes || ''}
                  onChange={handleFormChange}
                  className="mt-1 block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder={t('addCardModal.form.enterPlaceholder', { field: t('addCardModal.form.notes').toLowerCase()})}
                />
              </div>
            </form>
          )}
        </main>

        <footer className="flex flex-col sm:flex-row items-center justify-end gap-3 p-4 sm:p-6 border-t border-neutral-200 bg-neutral-light/50">
          <button
            type="button"
            onClick={handleClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-neutral-dark bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            {t('addCardModal.cancel')}
          </button>
          {step === 1 && (
            <button
              type="button"
              onClick={uploadMode === 'image' ? handleScanImage : handleParseDocument}
              disabled={
                isProcessing || isCameraOpen ||
                (uploadMode === 'image' && !selectedImage && !previewUrl) || // Ensure an image is selected or captured
                (uploadMode === 'file' && !selectedDocumentFile)
              }
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-secondary hover:bg-emerald-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-50 transition-colors"
            >
              {isProcessing ? (
                <SpinnerIcon className="w-5 h-5 mr-2" />
              ) : (
                uploadMode === 'image' ? <ScanIcon className="w-5 h-5 mr-2" /> : <FileTextIcon className="w-5 h-5 mr-2" />
              )}
              {isProcessing ? currentProcessingLabel : currentActionLabel}
            </button>
          )}
          {step === 2 && (
            <>
            <button
              type="button"
              onClick={() => {
                setError(null); 
                setCameraError(null);
                setStep(1); 
                // Don't reset selected files/preview here, user might want to re-process with adjustments or re-upload/re-capture
              }}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-neutral-dark bg-white border border-neutral-300 rounded-md shadow-sm hover:bg-neutral-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
               <EditIcon className="w-5 h-5 mr-2"/>
              {t('addCardModal.editRescan')}
            </button>
            <button
              type="button"
              onClick={handleSaveContact}
              className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-indigo-700 border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <UserIcon className="w-5 h-5 mr-2" />
              {t('addCardModal.saveContact')}
            </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};

export default AddCardModal;
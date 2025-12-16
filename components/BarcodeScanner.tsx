import React, { useRef, useEffect, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useTranslation } from 'react-i18next';
import { CameraIcon, XMarkIcon, CheckCircleIcon } from './icons';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: BarcodeData) => void;
}

export interface BarcodeData {
  rawData: string;
  name?: string;
  phone?: string;
  email?: string;
  company?: string;
  website?: string;
  address?: string;
  format: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detectedData, setDetectedData] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const codeReader = new BrowserMultiFormatReader();
    codeReaderRef.current = codeReader;

    const startScanning = async () => {
      try {
        setScanning(true);
        setError(null);

        const videoInputDevices = await codeReader.listVideoInputDevices();
        
        if (videoInputDevices.length === 0) {
          setError('No camera found on this device');
          setScanning(false);
          return;
        }

        // Prefer back camera on mobile devices
        const selectedDevice = videoInputDevices.find(device => 
          device.label.toLowerCase().includes('back')
        ) || videoInputDevices[0];

        codeReader.decodeFromVideoDevice(
          selectedDevice.deviceId,
          videoRef.current!,
          (result, err) => {
            if (result) {
              const barcodeText = result.getText();
              const format = result.getBarcodeFormat().toString();
              
              setDetectedData(barcodeText);
              
              // Parse the barcode data
              const parsedData = parseVCard(barcodeText) || parseContactData(barcodeText);
              
              const barcodeData: BarcodeData = {
                rawData: barcodeText,
                format,
                ...parsedData
              };

              // Auto-process after 1 second
              setTimeout(() => {
                onScanSuccess(barcodeData);
                handleClose();
              }, 1000);
            }

            if (err && !(err instanceof NotFoundException)) {
              console.error('Barcode scan error:', err);
            }
          }
        );
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError(err.message || 'Failed to access camera');
        setScanning(false);
      }
    };

    startScanning();

    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
    setDetectedData(null);
    setError(null);
    onClose();
  };

  // Parse vCard format (common in QR codes on business cards)
  const parseVCard = (vcard: string): Partial<BarcodeData> | null => {
    if (!vcard.startsWith('BEGIN:VCARD')) return null;

    const lines = vcard.split('\n');
    const data: Partial<BarcodeData> = {};

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':');
      const value = valueParts.join(':').trim();

      if (key.startsWith('FN')) {
        data.name = value;
      } else if (key.startsWith('TEL')) {
        data.phone = value.replace(/[^0-9+]/g, '');
      } else if (key.startsWith('EMAIL')) {
        data.email = value;
      } else if (key.startsWith('ORG')) {
        data.company = value;
      } else if (key.startsWith('URL')) {
        data.website = value;
      } else if (key.startsWith('ADR')) {
        data.address = value.replace(/;/g, ', ');
      }
    });

    return data;
  };

  // Parse other contact formats (simple text parsing)
  const parseContactData = (text: string): Partial<BarcodeData> => {
    const data: Partial<BarcodeData> = {};

    // Extract phone number
    const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      data.phone = phoneMatch[0].replace(/[^0-9+]/g, '');
    }

    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) {
      data.email = emailMatch[0];
    }

    // Extract website
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      data.website = urlMatch[0];
    }

    // If no structured data found, try to extract name from first line
    if (!data.name && text.split('\n').length > 0) {
      const firstLine = text.split('\n')[0].trim();
      if (firstLine.length > 0 && firstLine.length < 50) {
        data.name = firstLine;
      }
    }

    return data;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CameraIcon className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Scan QR/Barcode</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close scanner"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <p className="mt-2 text-indigo-100">
            Point your camera at a QR code or barcode on a business card
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            className="w-full h-96 object-cover"
            autoPlay
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          {scanning && !detectedData && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-4 border-green-500 rounded-lg w-64 h-64 animate-pulse">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500"></div>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {detectedData && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
              <div className="text-center text-white">
                <CheckCircleIcon className="w-24 h-24 mx-auto mb-4 animate-bounce" />
                <h3 className="text-2xl font-bold mb-2">Code Detected!</h3>
                <p className="text-green-100">Processing contact information...</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ensure good lighting</li>
            <li>• Hold the camera steady</li>
            <li>• Keep the code within the scanning area</li>
            <li>• Make sure the code is in focus</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;

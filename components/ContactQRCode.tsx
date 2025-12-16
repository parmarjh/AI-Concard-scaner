
import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { useTranslation } from 'react-i18next';
import { Contact } from '../types';
import { generateVCard } from '../utils/contactSaver';
import { CloseIcon, DownloadIcon, ShareIcon, QrCodeIcon, ImageFileIcon } from './icons';

interface ContactQRCodeProps {
    contact: Contact;
    isOpen: boolean;
    onClose: () => void;
}

const ContactQRCode: React.FC<ContactQRCodeProps> = ({ contact, isOpen, onClose }) => {
    const { t } = useTranslation();
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
    const [is3DMode, setIs3DMode] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (isOpen && contact) {
            generateQR();
        }
    }, [contact, isOpen]);

    const generateQR = async () => {
        try {
            const vcardData = generateVCard(contact);
            const url = await QRCode.toDataURL(vcardData, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#4F46E5', // Primary indigo color
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            });
            setQrDataUrl(url);
        } catch (err) {
            console.error('Error generating QR code:', err);
        }
    };

    const handleDownload = () => {
        if (qrDataUrl) {
            const link = document.createElement('a');
            link.href = qrDataUrl;
            link.download = `qr-${contact.name.replace(/\s+/g, '-').toLowerCase()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const toggle3D = () => {
        setIs3DMode(!is3DMode);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-[110]" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition-colors z-10"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <div className="p-6 text-center">

                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{t('contactQR.title', { defaultValue: 'Contact Barcode' })}</h2>
                    <p className="text-gray-500 text-sm mb-6">{t('contactQR.subtitle', { defaultValue: 'Scan to add to contacts' })}</p>

                    <div className="relative flex justify-center items-center py-4 min-h-[320px] bg-gray-50 rounded-xl mb-6 perspective-1000">
                        {showOriginal && contact.cardImageUrl ? (
                            <div className="relative animate-fadeIn">
                                <img
                                    src={contact.cardImageUrl}
                                    alt="Original Card"
                                    className="max-w-full max-h-[280px] rounded-lg shadow-lg object-contain"
                                />
                                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    Handwritten / Original
                                </div>
                            </div>
                        ) : (
                            <div className={`transition-all duration-700 ease-in-out ${is3DMode ? 'transform rotate-y-12 rotate-x-6 hover:rotate-y-0 hover:rotate-x-0 cursor-pointer shadow-2xl' : ''}`}>
                                {qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="Contact QR Code"
                                        className={`rounded-lg ${is3DMode ? 'shadow-2xl ring-4 ring-white' : 'shadow-none'}`}
                                        style={{
                                            transformStyle: 'preserve-3d',
                                            backfaceVisibility: 'hidden'
                                        }}
                                        onClick={toggle3D}
                                        title={is3DMode ? "3D Mode Active" : "Click to view 3D"}
                                    />
                                ) : (
                                    <div className="w-[300px] h-[300px] flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 justify-center mb-6">
                        <button
                            onClick={() => setShowOriginal(false)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!showOriginal ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            2D/3D Barcode
                        </button>
                        {contact.cardImageUrl && (
                            <button
                                onClick={() => setShowOriginal(true)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${showOriginal ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                Original Card
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={toggle3D}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${is3DMode ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300'}`}
                        >
                            <div className="w-5 h-5 flex items-center justify-center border border-current rounded text-[10px] font-bold">3D</div>
                            {is3DMode ? '2D View' : '3D View'}
                        </button>

                        <button
                            onClick={handleDownload}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-medium transition-colors shadow-lg hover:shadow-xl"
                        >
                            <DownloadIcon className="w-5 h-5" />
                            Save Code
                        </button>
                    </div>
                </div>
            </div>
            <style>{`
        .perspective-1000 {
            perspective: 1000px;
        }
        .rotate-y-12 {
            transform: rotateY(25deg) rotateX(10deg);
        }
      `}</style>
        </div>
    );
};

export default ContactQRCode;

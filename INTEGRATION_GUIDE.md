# Integration Guide: Adding New Features to AddCardModal

## Overview
This guide shows how to integrate the barcode scanner, avatar generator, and contact saver into the existing AddCardModal component.

## Step 1: Import New Components and Utilities

Add these imports to `AddCardModal.tsx`:

```typescript
import BarcodeScanner, { BarcodeData } from './BarcodeScanner';
import { autoGenerateAvatar } from '../utils/avatarGenerator';
import { saveAsVCard, shareContact, autoSaveContact } from '../utils/contactSaver';
import { QrCodeIcon, DownloadIcon, ShareIcon } from './icons';
```

## Step 2: Add State for Barcode Scanner

Add this state to the AddCardModal component:

```typescript
const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
```

## Step 3: Add Barcode Scan Handler

Add this function to handle barcode scan results:

```typescript
const handleBarcodeScan = useCallback((data: BarcodeData) => {
  // Populate form with scanned data
  setFormData(prev => ({
    ...prev,
    name: data.name || prev.name,
    phone: data.phone || prev.phone,
    email: data.email || prev.email,
    company: data.company || prev.company,
    website: data.website || prev.website,
    address: data.address || prev.address,
  }));

  // Move to step 2 (review)
  setCurrentStep(2);
  
  // Close scanner
  setShowBarcodeScanner(false);

  // Show success message
  console.log('Contact information scanned successfully!');
}, []);
```

## Step 4: Modify Save Handler to Include Avatar Generation

Update the `handleSaveContact` function:

```typescript
const handleSaveContact = useCallback(async () => {
  if (!formData.name) {
    setError(t('addCardModal.errorNameRequired'));
    return;
  }

  try {
    // Generate avatar if no image provided
    let avatarUrl = undefined;
    if (!capturedImageDataUrl && !selectedImage) {
      avatarUrl = await autoGenerateAvatar(
        { name: formData.name },
        'gradient' // or 'initials', 'avataaars', etc.
      );
    }

    const newContact: Contact = {
      id: Date.now().toString(),
      name: formData.name,
      title: formData.title,
      company: formData.company,
      phone: formData.phone ? formData.phone.split(',').map(p => p.trim()) : [],
      email: formData.email ? formData.email.split(',').map(e => e.trim()) : [],
      address: formData.address,
      website: formData.website,
      notes: formData.notes,
      cardImageUrl: capturedImageDataUrl || selectedImage,
      imageUrl: avatarUrl, // Add generated avatar
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save contact
    onSave(newContact);

    // Auto-save to device if enabled
    if (autoSaveEnabled) {
      await autoSaveContact(newContact, {
        autoDownload: true,
        showNotification: true
      });
    }

    // Reset and close
    handleClose();
  } catch (error) {
    console.error('Error saving contact:', error);
    setError('Failed to save contact. Please try again.');
  }
}, [formData, capturedImageDataUrl, selectedImage, autoSaveEnabled, onSave, t]);
```

## Step 5: Add UI Elements

### Add "Scan QR/Barcode" Button

In the Step 1 UI (where upload options are shown), add:

```tsx
{/* Scan QR/Barcode Option */}
<div className="mt-6 p-4 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50">
  <div className="text-center">
    <QrCodeIcon className="mx-auto h-12 w-12 text-purple-600" />
    <h3 className="mt-2 text-sm font-medium text-gray-900">
      Scan QR Code or Barcode
    </h3>
    <p className="mt-1 text-sm text-gray-500">
      Scan a QR code from a business card
    </p>
    <button
      type="button"
      onClick={() => setShowBarcodeScanner(true)}
      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
    >
      <QrCodeIcon className="mr-2 h-5 w-5" />
      Scan QR/Barcode
    </button>
  </div>
</div>
```

### Add Export Buttons in Step 2

After the contact form in Step 2, add export options:

```tsx
{/* Export Options */}
<div className="mt-6 flex space-x-3">
  <button
    type="button"
    onClick={async () => {
      const contact = {
        id: 'temp',
        name: formData.name || '',
        title: formData.title,
        company: formData.company,
        phone: formData.phone?.split(',').map(p => p.trim()),
        email: formData.email?.split(',').map(e => e.trim()),
        address: formData.address,
        website: formData.website,
        notes: formData.notes,
        cardImageUrl: capturedImageDataUrl || selectedImage,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveAsVCard(contact);
    }}
    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
  >
    <DownloadIcon className="mr-2 h-5 w-5" />
    Export vCard
  </button>

  {navigator.share && (
    <button
      type="button"
      onClick={async () => {
        const contact = {
          id: 'temp',
          name: formData.name || '',
          title: formData.title,
          company: formData.company,
          phone: formData.phone?.split(',').map(p => p.trim()),
          email: formData.email?.split(',').map(e => e.trim()),
          address: formData.address,
          website: formData.website,
          notes: formData.notes,
          cardImageUrl: capturedImageDataUrl || selectedImage,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await shareContact(contact);
      }}
      className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
    >
      <ShareIcon className="mr-2 h-5 w-5" />
      Share
    </button>
  )}
</div>

{/* Auto-save Toggle */}
<div className="mt-4 flex items-center">
  <input
    id="auto-save"
    type="checkbox"
    checked={autoSaveEnabled}
    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
  />
  <label htmlFor="auto-save" className="ml-2 block text-sm text-gray-900">
    Automatically save to device contacts (vCard)
  </label>
</div>
```

### Add Barcode Scanner Component

At the end of the modal JSX, before the closing div:

```tsx
{/* Barcode Scanner Modal */}
<BarcodeScanner
  isOpen={showBarcodeScanner}
  onClose={() => setShowBarcodeScanner(false)}
  onScanSuccess={handleBarcodeScan}
/>
```

## Step 6: Update Locale Files

Add translations for new features in `locales/en.json`:

```json
{
  "addCardModal": {
    "scanQrCode": "Scan QR/Barcode",
    "scanQrCodeDesc": "Scan a QR code from a business card",
    "exportVCard": "Export vCard",
    "shareContact": "Share Contact",
    "autoSaveLabel": "Automatically save to device contacts (vCard)",
    "scanSuccess": "Contact information scanned successfully!",
    "avatarGenerated": "Profile image generated automatically",
    "contactExported": "Contact exported successfully",
    "contactShared": "Contact shared successfully"
  }
}
```

## Step 7: Add Avatar Display in Contact Cards

Update `ContactCard.tsx` to display avatars:

```tsx
import { autoGenerateAvatar } from '../utils/avatarGenerator';

// In the component
const [avatarUrl, setAvatarUrl] = useState(contact.imageUrl);

useEffect(() => {
  if (!contact.imageUrl && contact.name) {
    autoGenerateAvatar(contact, 'gradient').then(setAvatarUrl);
  }
}, [contact]);

// In the JSX
<div className="flex items-center space-x-4">
  <img
    src={avatarUrl || contact.cardImageUrl || '/default-avatar.png'}
    alt={contact.name}
    className="w-16 h-16 rounded-full object-cover border-2 border-primary"
  />
  <div>
    <h3 className="text-lg font-semibold">{contact.name}</h3>
    {contact.title && <p className="text-sm text-gray-600">{contact.title}</p>}
  </div>
</div>
```

## Step 8: Testing Checklist

- [ ] QR code scanning works with vCard format
- [ ] Barcode scanning detects phone numbers and emails
- [ ] Avatar generates when no image is provided
- [ ] vCard export downloads correctly
- [ ] vCard can be imported into contacts app
- [ ] Share functionality works on mobile
- [ ] Auto-save creates vCard file
- [ ] Notifications appear when enabled
- [ ] All UI elements are responsive
- [ ] Error handling works properly

## Step 9: Performance Optimization

Add lazy loading for the barcode scanner:

```typescript
import { lazy, Suspense } from 'react';

const BarcodeScanner = lazy(() => import('./BarcodeScanner'));

// In JSX
<Suspense fallback={<div>Loading scanner...</div>}>
  {showBarcodeScanner && (
    <BarcodeScanner
      isOpen={showBarcodeScanner}
      onClose={() => setShowBarcodeScanner(false)}
      onScanSuccess={handleBarcodeScan}
    />
  )}
</Suspense>
```

## Step 10: Error Handling

Add comprehensive error handling:

```typescript
const handleBarcodeScan = useCallback((data: BarcodeData) => {
  try {
    if (!data.name && !data.phone && !data.email) {
      setError('No contact information found in the scanned code');
      return;
    }

    // ... rest of the code
  } catch (error) {
    console.error('Barcode scan error:', error);
    setError('Failed to process scanned data. Please try again.');
  }
}, []);
```

## Complete Example

See `FEATURES.md` for complete code examples and API documentation.

## Troubleshooting

**Issue:** Camera permission denied
**Solution:** Ensure app is running on HTTPS and request permissions properly

**Issue:** Avatar not generating
**Solution:** Check internet connection for DiceBear API or use offline 'initials' style

**Issue:** vCard not downloading
**Solution:** Check browser settings and ensure pop-ups are allowed

## Next Steps

1. Test on multiple devices and browsers
2. Add analytics to track feature usage
3. Implement user preferences for avatar style
4. Add batch scanning for multiple cards
5. Integrate with cloud storage for backup

---

**Last Updated:** December 2025
**Status:** Ready for Integration

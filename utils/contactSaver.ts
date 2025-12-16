import { Contact } from '../types';

/**
 * Utility to save contacts directly to the device using the Contact Picker API
 * and generate vCard files for download
 */

export interface ContactSaveResult {
    success: boolean;
    method: 'native' | 'vcard' | 'unsupported';
    message: string;
}

/**
 * Save contact to device using native Contact Picker API (if available)
 * Falls back to vCard download for unsupported browsers
 */
export async function saveToDeviceContacts(contact: Contact): Promise<ContactSaveResult> {
    // Check if Contact Picker API is available (currently limited browser support)
    if ('contacts' in navigator && 'ContactsManager' in window) {
        try {
            // Note: Contact Picker API is read-only in most browsers
            // We'll use vCard as the primary method
            return await saveAsVCard(contact);
        } catch (error) {
            console.error('Contact Picker API error:', error);
            return await saveAsVCard(contact);
        }
    }

    // Fallback to vCard download
    return await saveAsVCard(contact);
}

/**
 * Generate and download a vCard file
 */
export async function saveAsVCard(contact: Contact): Promise<ContactSaveResult> {
    try {
        const vcard = generateVCard(contact);

        // Create blob and download
        const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `${contact.name || 'contact'}.vcf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);

        return {
            success: true,
            method: 'vcard',
            message: 'Contact saved as vCard file. Open it to add to your contacts.'
        };
    } catch (error: any) {
        console.error('vCard generation error:', error);
        return {
            success: false,
            method: 'vcard',
            message: `Failed to save contact: ${error.message}`
        };
    }
}

/**
 * Generate vCard 3.0 format string from contact
 */
export function generateVCard(contact: Contact): string {
    const lines: string[] = [];

    lines.push('BEGIN:VCARD');
    lines.push('VERSION:3.0');

    // Name
    if (contact.name) {
        const nameParts = contact.name.split(' ');
        const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';
        const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : contact.name;
        lines.push(`N:${lastName};${firstName};;;`);
        lines.push(`FN:${contact.name}`);
    }

    // Organization and Title
    if (contact.company) {
        lines.push(`ORG:${contact.company}`);
    }
    if (contact.title) {
        lines.push(`TITLE:${contact.title}`);
    }

    // Phone numbers
    if (contact.phone) {
        const phones = Array.isArray(contact.phone) ? contact.phone : [contact.phone];
        phones.forEach((phone, index) => {
            const type = index === 0 ? 'WORK' : 'CELL';
            lines.push(`TEL;TYPE=${type}:${phone}`);
        });
    }

    // Email addresses
    if (contact.email) {
        const emails = Array.isArray(contact.email) ? contact.email : [contact.email];
        emails.forEach(email => {
            lines.push(`EMAIL;TYPE=INTERNET:${email}`);
        });
    }

    // Website
    if (contact.website) {
        const websites = Array.isArray(contact.website) ? contact.website : [contact.website];
        websites.forEach(website => {
            lines.push(`URL:${website}`);
        });
    }

    // Address
    if (contact.address) {
        const addresses = Array.isArray(contact.address) ? contact.address : [contact.address];
        addresses.forEach(address => {
            // Format: ADR;TYPE=WORK:;;street;city;state;postal;country
            lines.push(`ADR;TYPE=WORK:;;${address};;;;`);
        });
    }

    // Notes
    if (contact.notes) {
        lines.push(`NOTE:${contact.notes}`);
    }

    // Photo (if available as base64)
    if (contact.imageUrl && contact.imageUrl.startsWith('data:image')) {
        const base64Data = contact.imageUrl.split(',')[1];
        const imageType = contact.imageUrl.match(/data:image\/(\w+)/)?.[1]?.toUpperCase() || 'JPEG';
        lines.push(`PHOTO;ENCODING=b;TYPE=${imageType}:${base64Data}`);
    }

    // Timestamp
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    lines.push(`REV:${now}`);

    lines.push('END:VCARD');

    return lines.join('\r\n');
}

/**
 * Share contact using Web Share API (mobile-friendly)
 */
export async function shareContact(contact: Contact): Promise<ContactSaveResult> {
    if (!navigator.share) {
        return {
            success: false,
            method: 'unsupported',
            message: 'Sharing is not supported on this device'
        };
    }

    try {
        const vcard = generateVCard(contact);
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const file = new File([blob], `${contact.name || 'contact'}.vcf`, { type: 'text/vcard' });

        await navigator.share({
            files: [file],
            title: `Contact: ${contact.name}`,
            text: `Sharing contact information for ${contact.name}`
        });

        return {
            success: true,
            method: 'native',
            message: 'Contact shared successfully'
        };
    } catch (error: any) {
        if (error.name === 'AbortError') {
            return {
                success: false,
                method: 'native',
                message: 'Sharing cancelled'
            };
        }
        console.error('Share error:', error);
        return {
            success: false,
            method: 'native',
            message: `Failed to share: ${error.message}`
        };
    }
}

/**
 * Auto-save contact with user confirmation
 */
export async function autoSaveContact(
    contact: Contact,
    options: { autoDownload?: boolean; showNotification?: boolean } = {}
): Promise<ContactSaveResult> {
    const { autoDownload = false, showNotification = true } = options;

    if (autoDownload) {
        const result = await saveAsVCard(contact);

        if (showNotification && result.success && 'Notification' in window) {
            // Request notification permission if needed
            if (Notification.permission === 'granted') {
                new Notification('Contact Saved', {
                    body: `${contact.name} has been saved to your downloads`,
                    icon: contact.imageUrl || '/icon-192.png'
                });
            } else if (Notification.permission !== 'denied') {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('Contact Saved', {
                        body: `${contact.name} has been saved to your downloads`,
                        icon: contact.imageUrl || '/icon-192.png'
                    });
                }
            }
        }

        return result;
    }

    return {
        success: false,
        method: 'unsupported',
        message: 'Auto-save disabled'
    };
}


import { Contact } from '../types';

export interface GoogleContactSaveResult {
    success: boolean;
    message: string;
}

export async function saveToGoogleContacts(contact: Contact): Promise<GoogleContactSaveResult> {
    const token = sessionStorage.getItem('googleAccessToken');

    if (!token) {
        return {
            success: false,
            message: 'Not authenticated with Google. Please sign in again.',
        };
    }

    const personData = {
        names: contact.name ? [{ givenName: contact.name }] : [],
        organizations: contact.company || contact.title ? [{
            name: contact.company,
            title: contact.title
        }] : [],
        phoneNumbers: contact.phone ? contact.phone.map(p => ({ value: p })) : [],
        emailAddresses: contact.email ? contact.email.map(e => ({ value: e })) : [],
        urls: contact.website ? [{ value: contact.website }] : [],
        biographies: contact.notes ? [{ value: contact.notes, contentType: 'TEXT_PLAIN' }] : [],
        addresses: contact.address ? [{ formattedValue: contact.address }] : [],
    };

    try {
        const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(personData),
        });

        if (response.ok) {
            const data = await response.json();
            return {
                success: true,
                message: 'Successfully saved to Google Contacts!',
            };
        } else {
            const errorData = await response.json();
            console.error('Google People API Error:', errorData);
            return {
                success: false,
                message: `Failed to save: ${errorData.error?.message || response.statusText}`,
            };
        }
    } catch (error: any) {
        console.error('Network Error:', error);
        return {
            success: false,
            message: `Network error: ${error.message}`,
        };
    }
}

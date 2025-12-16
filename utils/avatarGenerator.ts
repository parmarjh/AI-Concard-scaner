/**
 * Avatar Generator Utility
 * Generates profile images for contacts using various methods:
 * 1. AI-generated avatars using DiceBear API
 * 2. Initials-based avatars
 * 3. Gradient backgrounds
 */

export interface AvatarOptions {
    name: string;
    style?: 'initials' | 'dicebear' | 'gradient' | 'bottts' | 'avataaars' | 'personas';
    size?: number;
    backgroundColor?: string;
    seed?: string;
}

/**
 * Generate an avatar image URL or data URL for a contact
 */
export async function generateAvatar(options: AvatarOptions): Promise<string> {
    const { name, style = 'dicebear', size = 200 } = options;

    switch (style) {
        case 'initials':
            return generateInitialsAvatar(name, size, options.backgroundColor);

        case 'gradient':
            return generateGradientAvatar(name, size);

        case 'dicebear':
        case 'bottts':
        case 'avataaars':
        case 'personas':
            return generateDiceBearAvatar(name, style, size);

        default:
            return generateInitialsAvatar(name, size);
    }
}

/**
 * Generate initials-based avatar as data URL
 */
function generateInitialsAvatar(
    name: string,
    size: number = 200,
    backgroundColor?: string
): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Get initials
    const initials = getInitials(name);

    // Generate color from name if not provided
    const bgColor = backgroundColor || generateColorFromString(name);
    const textColor = getContrastColor(bgColor);

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw initials
    ctx.fillStyle = textColor;
    ctx.font = `bold ${size * 0.4}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

/**
 * Generate gradient avatar as data URL
 */
function generateGradientAvatar(name: string, size: number = 200): string {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Generate two colors from name
    const color1 = generateColorFromString(name);
    const color2 = generateColorFromString(name + name);

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);

    // Draw gradient background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    // Draw initials
    const initials = getInitials(name);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${size * 0.4}px Inter, Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText(initials, size / 2, size / 2);

    return canvas.toDataURL('image/png');
}

/**
 * Generate avatar using DiceBear API
 */
function generateDiceBearAvatar(
    name: string,
    style: string = 'dicebear',
    size: number = 200
): string {
    const seed = encodeURIComponent(name);

    // Map styles to DiceBear avatar styles
    const styleMap: { [key: string]: string } = {
        'dicebear': 'avataaars',
        'bottts': 'bottts',
        'avataaars': 'avataaars',
        'personas': 'personas'
    };

    const avatarStyle = styleMap[style] || 'avataaars';

    return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}&size=${size}`;
}

/**
 * Get initials from name (max 2 characters)
 */
function getInitials(name: string): string {
    if (!name) return '??';

    const parts = name.trim().split(/\s+/);

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent color from a string
 */
function generateColorFromString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate HSL color for better visual appeal
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
    const lightness = 50 + (Math.abs(hash >> 8) % 15); // 50-65%

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get contrasting text color (black or white) for a background color
 */
function getContrastColor(bgColor: string): string {
    // Convert HSL to RGB for luminance calculation
    if (bgColor.startsWith('hsl')) {
        const matches = bgColor.match(/\d+/g);
        if (!matches || matches.length < 3) return '#FFFFFF';

        const h = parseInt(matches[0]);
        const s = parseInt(matches[1]) / 100;
        const l = parseInt(matches[2]) / 100;

        // Simple luminance check
        return l > 0.6 ? '#000000' : '#FFFFFF';
    }

    // For hex colors
    if (bgColor.startsWith('#')) {
        const hex = bgColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminance > 0.5 ? '#000000' : '#FFFFFF';
    }

    return '#FFFFFF';
}

/**
 * Auto-generate and assign avatar to contact if missing
 */
export async function autoGenerateAvatar(
    contact: { name?: string; imageUrl?: string },
    preferredStyle: AvatarOptions['style'] = 'gradient'
): Promise<string | undefined> {
    if (contact.imageUrl) {
        return contact.imageUrl; // Already has an image
    }

    if (!contact.name) {
        return undefined; // Can't generate without a name
    }

    try {
        const avatarUrl = await generateAvatar({
            name: contact.name,
            style: preferredStyle,
            size: 400
        });

        return avatarUrl;
    } catch (error) {
        console.error('Failed to generate avatar:', error);
        return undefined;
    }
}

/**
 * Batch generate avatars for multiple contacts
 */
export async function batchGenerateAvatars(
    contacts: Array<{ name?: string; imageUrl?: string }>,
    style: AvatarOptions['style'] = 'gradient'
): Promise<Map<number, string>> {
    const avatarMap = new Map<number, string>();

    const promises = contacts.map(async (contact, index) => {
        if (!contact.imageUrl && contact.name) {
            try {
                const avatar = await generateAvatar({
                    name: contact.name,
                    style,
                    size: 400
                });
                avatarMap.set(index, avatar);
            } catch (error) {
                console.error(`Failed to generate avatar for ${contact.name}:`, error);
            }
        }
    });

    await Promise.all(promises);
    return avatarMap;
}

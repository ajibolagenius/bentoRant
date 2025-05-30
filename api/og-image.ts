import { createCanvas, registerFont, loadImage, Image } from 'canvas';
import path from 'path';
import fs from 'fs';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Register a custom font for better OG image appearance (optional, requires font file in public/assets/fonts)
// registerFont(path.join(process.cwd(), 'public', 'assets', 'fonts', 'Inter-Bold.ttf'), { family: 'Inter', weight: 'bold' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const { rantId } = req.query;

        let rantText = 'Rant: Anonymous Space for Unfiltered Thoughts';
        let mood = null;
        let author = 'Anonymous';
        let createdAt = null;
        if (rantId) {
            // Fetch rant from Supabase
            const { data, error } = await supabase
                .from('rants')
                .select('content, mood, anonymous_user_id, created_at')
                .eq('id', rantId)
                .single();
            if (!error && data && data.content) {
                rantText = data.content;
                mood = data.mood;
                author = data.anonymous_user_id || 'Anonymous';
                createdAt = data.created_at;
            } else {
                rantText = 'Rant not found.';
            }
        }

        // Canvas settings
        const width = 1200;
        const height = 630;
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#18181b');
        gradient.addColorStop(1, '#23272f');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Draw a subtle pattern or accent (optional)
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < width; i += 60) {
            ctx.beginPath();
            ctx.arc(i, height / 2, 200, 0, 2 * Math.PI);
            ctx.fillStyle = '#a3e635';
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Add a rounded rectangle card for the rant text area
        ctx.save();
        ctx.beginPath();
        const cardX = 40;
        const cardY = 200;
        const cardW = width - 80;
        const cardH = 320;
        const radius = 36;
        ctx.moveTo(cardX + radius, cardY);
        ctx.lineTo(cardX + cardW - radius, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
        ctx.lineTo(cardX + cardW, cardY + cardH - radius);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
        ctx.lineTo(cardX + radius, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
        ctx.lineTo(cardX, cardY + radius);
        ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(24,24,27,0.92)';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 32;
        ctx.fill();
        ctx.restore();

        // Draw mood emoji if available
        if (mood) {
            // Try to load emoji from public/assets/emojis/{mood}.png or .webp
            const emojiPathPng = path.join(process.cwd(), 'public', 'assets', 'emojis', `${mood}.png`);
            const emojiPathWebp = path.join(process.cwd(), 'public', 'assets', 'emojis', `${mood}.webp`);
            let emojiImg: Image | null = null;
            if (fs.existsSync(emojiPathPng)) {
                emojiImg = await loadImage(emojiPathPng) as Image;
            } else if (fs.existsSync(emojiPathWebp)) {
                emojiImg = await loadImage(emojiPathWebp) as Image;
            }
            if (emojiImg) {
                ctx.drawImage(emojiImg, width - 180, 60, 100, 100);
            }
        }

        // Optionally, add logo
        const logoPath = path.join(process.cwd(), 'public', 'assets', 'rant_logo.svg');
        if (fs.existsSync(logoPath)) {
            const logo = await loadImage(logoPath);
            ctx.drawImage(logo, 60, 60, 120, 120);
        }

        // Title
        ctx.font = 'bold 60px Arial'; // Use 'Inter' if registered
        ctx.fillStyle = '#fff';
        ctx.shadowColor = '#23272f';
        ctx.shadowBlur = 8;
        ctx.fillText('Rant', 210, 120);
        ctx.shadowBlur = 0;

        // Author and timestamp
        ctx.font = '28px Arial';
        ctx.fillStyle = '#a0aec0';
        if (author) {
            ctx.fillText(`by ${author}`, 210, 160);
        }
        if (createdAt) {
            const date = new Date(createdAt);
            ctx.fillText(date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), 210, 195);
        }

        // Mood color accent bar (optional)
        if (mood) {
            // Simple color mapping for demo
            const moodColors = {
                happy: '#FBBF24',
                sad: '#8B93A7',
                angry: '#E74C3C',
                loved: '#FF66B2',
                neutral: '#9CA3AF',
                // ...add more as needed
            };
            ctx.fillStyle = moodColors[mood] || '#904FFF';
            ctx.fillRect(cardX, cardY - 16, cardW, 8);
        }

        // Rant text (wrap if needed, max 5 lines)
        ctx.font = '36px Arial';
        ctx.fillStyle = '#e0e0e0';
        const maxWidth = width - 120;
        let lines: string[] = wrapText(ctx, rantText, cardW - 60);
        if (lines.length > 5) {
            lines = lines.slice(0, 5);
            lines[4] = (lines[4] as string).slice(0, 60) + '...';
        }
        lines.forEach((line, i) => {
            ctx.fillText(line, cardX + 30, cardY + 70 + i * 54);
        });

        // Footer
        ctx.font = '28px Arial';
        ctx.fillStyle = '#a3e635';
        ctx.shadowColor = '#23272f';
        ctx.shadowBlur = 6;
        ctx.fillText('Share your thoughts anonymously', 60, height - 60);
        ctx.shadowBlur = 0;

        // Output as PNG
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        canvas.createPNGStream().pipe(res);
    } catch (err) {
        // Error handling: fallback to a static image or error message
        try {
            const fallbackPath = path.join(process.cwd(), 'public', 'assets', 'rant_landing.png');
            if (fs.existsSync(fallbackPath)) {
                res.setHeader('Content-Type', 'image/png');
                res.setHeader('Cache-Control', 'public, max-age=86400');
                fs.createReadStream(fallbackPath).pipe(res);
                return;
            }
        } catch (err) {
            // ignore fallback error
        }
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Failed to generate OG image.');
    }
}

// Helper to wrap text for canvas
function wrapText(ctx, text, maxWidth): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let line = '';
    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            lines.push(line.trim());
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line.trim());
    return lines;
}

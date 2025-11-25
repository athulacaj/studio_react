import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI = null;
let model = null;

if (API_KEY) {
  genAI = new GoogleGenerativeAI(API_KEY);
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
}

/**
 * Generate portfolio content suggestions using Gemini AI
 * @param {string} prompt - The prompt for content generation
 * @returns {Promise<string>} - Generated content
 */
export async function generateContent(prompt) {
  if (!model) {
    throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file');
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

/**
 * Generate portfolio design suggestions
 * @param {Object} params - Portfolio parameters
 * @returns {Promise<Object>} - Design suggestions
 */
export async function generatePortfolioDesign(params) {
  const { photographyStyle, targetAudience, colorPreference, mood } = params;
  
  const prompt = `As a professional web designer, suggest a portfolio website design for a photographer with the following preferences:
- Photography Style: ${photographyStyle}
- Target Audience: ${targetAudience}
- Color Preference: ${colorPreference}
- Mood: ${mood}

Provide suggestions in JSON format with the following structure:
{
  "colorPalette": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "text": "#hexcode"
  },
  "typography": {
    "headingFont": "font-name",
    "bodyFont": "font-name"
  },
  "layout": "layout-type (grid/masonry/slider)",
  "sections": ["section1", "section2", ...],
  "designNotes": "brief explanation of design choices"
}`;

  try {
    const response = await generateContent(prompt);
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse design suggestions');
  } catch (error) {
    console.error('Error generating portfolio design:', error);
    // Return default design
    return {
      colorPalette: {
        primary: '#6366f1',
        secondary: '#a855f7',
        accent: '#ec4899',
        background: '#0f172a',
        text: '#f8fafc'
      },
      typography: {
        headingFont: 'Playfair Display',
        bodyFont: 'Inter'
      },
      layout: 'grid',
      sections: ['hero', 'gallery', 'about', 'contact'],
      designNotes: 'Modern, elegant design with focus on visual content'
    };
  }
}

/**
 * Generate portfolio content (bio, descriptions, etc.)
 * @param {Object} params - Content parameters
 * @returns {Promise<Object>} - Generated content
 */
export async function generatePortfolioContent(params) {
  const { name, specialty, experience, achievements } = params;
  
  const prompt = `Write professional portfolio content for a photographer named ${name}.
Specialty: ${specialty}
Experience: ${experience}
Achievements: ${achievements}

Generate the following in JSON format:
{
  "bio": "professional bio (2-3 sentences)",
  "tagline": "catchy tagline",
  "aboutSection": "detailed about section (3-4 paragraphs)",
  "metaDescription": "SEO meta description"
}`;

  try {
    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse content suggestions');
  } catch (error) {
    console.error('Error generating portfolio content:', error);
    return {
      bio: `${name} is a professional ${specialty} photographer with ${experience} of experience.`,
      tagline: 'Capturing moments, creating memories',
      aboutSection: `Welcome to my portfolio. I'm ${name}, specializing in ${specialty}.`,
      metaDescription: `${name} - Professional ${specialty} photographer portfolio`
    };
  }
}

export { genAI, model };

# Portfolio Builder Feature

## Overview

The Portfolio Builder is a powerful feature that allows photographers to create custom portfolio websites using Firebase and AI integration. It provides a step-by-step wizard interface to build beautiful, professional portfolios with AI-powered design and content suggestions.

## Features

### 🎨 AI-Powered Design
- **Gemini AI Integration**: Get intelligent design suggestions based on your photography style
- **Custom Color Palettes**: AI-generated color schemes that match your brand
- **Layout Options**: Choose from Grid, Masonry, or Slider layouts
- **Mood-Based Designs**: Select from Professional, Creative, Elegant, Modern, Vintage, or Bold themes

### ✍️ AI Content Generation
- **Automated Bio Writing**: Generate professional bios based on your information
- **SEO Optimization**: AI-generated meta descriptions for better search visibility
- **Content Suggestions**: Get help writing about sections, taglines, and service descriptions

### 📸 Gallery Management
- **Firebase Storage Integration**: Securely upload and store images
- **Image Metadata**: Add titles, descriptions, and categories to your photos
- **Drag & Drop**: Easy image upload with progress tracking
- **Real-time Preview**: See your gallery as you build it

### 👁️ Live Preview
- **Responsive Design**: Preview your portfolio in desktop and mobile views
- **Real-time Updates**: See changes instantly as you build
- **Multiple Sections**: Preview home, gallery, and about pages

## Technology Stack

- **React 19**: Modern React with hooks and context
- **Firebase**: Backend services (Firestore, Storage, Auth, Analytics)
- **Gemini AI**: Google's generative AI for content and design suggestions
- **Material-UI**: Professional UI components
- **Framer Motion**: Smooth animations and transitions

## Setup Instructions

### 1. Firebase Configuration

Create a `.env` file in the project root with your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Gemini AI Configuration

Add your Gemini API key to the `.env` file:

```env
VITE_GEMINI_API_KEY=your-gemini-api-key
```

Get your API key from: https://makersuite.google.com/app/apikey

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable the following services:
   - **Authentication**: Enable Email/Password provider
   - **Firestore Database**: Create a database in production mode
   - **Storage**: Set up Cloud Storage
   - **Analytics**: (Optional) Enable Google Analytics

4. Set up Firestore Security Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Portfolios collection
    match /portfolios/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Templates collection (read-only for users)
    match /templates/{templateId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

5. Set up Storage Security Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /portfolios/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Usage

### Accessing the Portfolio Builder

Navigate to `/portfolio-builder` in your application to start building your portfolio.

### Step-by-Step Guide

#### Step 1: Basic Info
- Enter your name, email, and contact information
- Select your photography styles (Wedding, Portrait, Landscape, etc.)
- Add years of experience
- Create a catchy tagline

#### Step 2: Design
- Choose a layout style (Grid, Masonry, or Slider)
- Select a color scheme (Dark, Light, Minimal, or Vibrant)
- Pick a mood for your portfolio
- **AI Feature**: Click "AI Design Suggestions" to get personalized design recommendations

#### Step 3: Content
- Write or generate your bio
- Create an about section
- List your achievements and awards
- Describe your services
- Add SEO meta description
- **AI Feature**: Click "AI Content Generator" to automatically create professional content

#### Step 4: Gallery
- Upload your best photographs
- Add titles and descriptions to images
- Organize images by category
- Edit or remove images as needed

#### Step 5: Preview
- Review your portfolio in desktop and mobile views
- Navigate through different sections
- Make final adjustments
- Save as draft or publish

### Saving and Publishing

- **Save Draft**: Saves your progress to Firebase Firestore
- **Publish**: Makes your portfolio live and accessible

## File Structure

```
src/features/portfoliobuilder/
├── components/
│   ├── BasicInfoStep.jsx       # Step 1: Personal information
│   ├── DesignStep.jsx          # Step 2: Design selection with AI
│   ├── ContentStep.jsx         # Step 3: Content creation with AI
│   ├── GalleryStep.jsx         # Step 4: Image upload and management
│   └── PreviewStep.jsx         # Step 5: Portfolio preview
├── context/
│   └── PortfolioBuilderContext.jsx  # State management
├── pages/
│   └── PortfolioBuilderPage.jsx     # Main page component
└── index.js                    # Feature exports
```

## API Reference

### Context Methods

```javascript
const {
  portfolio,           // Current portfolio data
  loading,            // Loading state
  error,              // Error state
  templates,          // Available templates
  loadPortfolio,      // Load user's portfolio
  createPortfolio,    // Create new portfolio
  updatePortfolio,    // Update existing portfolio
  deletePortfolio,    // Delete portfolio
  togglePublish       // Publish/unpublish portfolio
} = usePortfolioBuilder();
```

### AI Functions

```javascript
import { 
  generatePortfolioDesign,   // Generate design suggestions
  generatePortfolioContent   // Generate content
} from '../../../config/gemini';

// Generate design
const design = await generatePortfolioDesign({
  photographyStyle: 'Wedding, Portrait',
  targetAudience: 'Potential clients',
  colorPreference: 'dark',
  mood: 'Elegant'
});

// Generate content
const content = await generatePortfolioContent({
  name: 'John Doe',
  specialty: 'Wedding Photography',
  experience: '5 years',
  achievements: 'Award-winning photographer'
});
```

## Data Models

### Portfolio Document (Firestore)

```javascript
{
  userId: string,
  basicInfo: {
    name: string,
    email: string,
    phone: string,
    location: string,
    website: string,
    photographyStyles: string[],
    experience: number,
    tagline: string
  },
  design: {
    layout: 'grid' | 'masonry' | 'slider',
    colorScheme: 'dark' | 'light' | 'minimal' | 'vibrant',
    mood: string,
    customColors: {
      primary: string,
      secondary: string,
      accent: string,
      background: string,
      text: string
    },
    aiGenerated: boolean
  },
  content: {
    bio: string,
    aboutSection: string,
    tagline: string,
    metaDescription: string,
    achievements: string,
    services: string
  },
  gallery: [{
    url: string,
    fileName: string,
    title: string,
    description: string,
    category: string,
    uploadedAt: string
  }],
  createdAt: string,
  updatedAt: string,
  published: boolean
}
```

## Best Practices

1. **Image Optimization**: Compress images before uploading to reduce storage costs
2. **SEO**: Use descriptive titles and alt text for all images
3. **Content Quality**: Review AI-generated content and personalize it
4. **Regular Updates**: Keep your portfolio fresh with new work
5. **Mobile First**: Always preview in mobile view before publishing

## Troubleshooting

### Common Issues

**AI Features Not Working**
- Ensure `VITE_GEMINI_API_KEY` is set in `.env`
- Check API key validity
- Verify internet connection

**Images Not Uploading**
- Check Firebase Storage rules
- Verify authentication status
- Ensure file size is within limits

**Portfolio Not Saving**
- Verify Firebase Firestore rules
- Check user authentication
- Review browser console for errors

## Future Enhancements

- [ ] Custom domain support
- [ ] Template marketplace
- [ ] Social media integration
- [ ] Analytics dashboard
- [ ] Client galleries and proofing
- [ ] E-commerce integration for print sales
- [ ] Blog functionality
- [ ] Contact form with email notifications

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase and Gemini AI documentation
3. Check browser console for error messages
4. Ensure all environment variables are correctly set

## License

This feature is part of the Studio React project.

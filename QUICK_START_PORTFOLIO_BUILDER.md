# Portfolio Builder - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies (Already Done ✅)
The required packages are already installed:
- `firebase` - Backend services
- `@google/generative-ai` - AI integration

### Step 2: Configure Firebase

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add Project"
   - Follow the setup wizard

2. **Get Your Configuration**
   - In Project Settings, find your Firebase config
   - Copy the configuration values

3. **Create `.env` File**
   Create a `.env` file in the project root:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

4. **Enable Firebase Services**
   - **Authentication**: Go to Authentication → Sign-in method → Enable Email/Password
   - **Firestore**: Go to Firestore Database → Create database (Start in production mode)
   - **Storage**: Go to Storage → Get started

5. **Set Security Rules**
   
   **Firestore Rules** (Firestore Database → Rules):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /portfolios/{userId} {
         allow read: if true;
         allow write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```
   
   **Storage Rules** (Storage → Rules):
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

### Step 3: Configure Gemini AI

1. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy your API key

2. **Add to `.env`**
   ```env
   VITE_GEMINI_API_KEY=your-gemini-api-key-here
   ```

### Step 4: Start the Development Server

```bash
npm run dev
```

### Step 5: Access Portfolio Builder

Navigate to: `http://localhost:5173/portfolio-builder`

## 🎯 Quick Test

1. **Fill Basic Info**
   - Name: "John Doe"
   - Email: "john@example.com"
   - Photography Styles: Select "Wedding", "Portrait"
   - Experience: "5"
   - Tagline: "Capturing Life's Beautiful Moments"

2. **Try AI Design**
   - Click "AI Design Suggestions"
   - Review the generated color palette

3. **Generate Content**
   - Add some achievements in the text field
   - Click "AI Content Generator"
   - Review the generated bio and about section

4. **Upload Images**
   - Click "Upload Images"
   - Select 3-5 sample photos
   - Add titles to your images

5. **Preview**
   - Switch between Desktop and Mobile views
   - Navigate through tabs
   - Click "Publish" when ready!

## 🔍 Troubleshooting

### AI Features Not Working?
- ✅ Check if `VITE_GEMINI_API_KEY` is in `.env`
- ✅ Restart dev server after adding `.env`
- ✅ Verify API key is valid

### Images Not Uploading?
- ✅ Check Firebase Storage is enabled
- ✅ Verify storage rules are set
- ✅ Check browser console for errors

### Can't Save Portfolio?
- ✅ Enable Firebase Authentication
- ✅ Check Firestore rules
- ✅ Sign in with a test account

## 📚 Next Steps

- Read the full [README](src/features/portfoliobuilder/README.md)
- Review [Implementation Summary](PORTFOLIO_BUILDER_SUMMARY.md)
- Customize the design and layouts
- Add your own templates

## 💡 Tips

1. **Start Simple**: Fill in basic info first, then enhance with AI
2. **Test AI**: Try AI features with different inputs to see variations
3. **Optimize Images**: Compress images before uploading
4. **Mobile First**: Always check mobile preview
5. **Save Often**: Use "Save Draft" frequently

## 🎨 Customization Ideas

- Modify color schemes in `DesignStep.jsx`
- Add new photography styles in `BasicInfoStep.jsx`
- Create custom layouts in `PreviewStep.jsx`
- Add more AI prompts in `gemini.js`

## ✨ You're All Set!

Your Portfolio Builder is ready to use. Start creating beautiful photography portfolios! 🎉

---

**Need Help?** Check the detailed README in `src/features/portfoliobuilder/README.md`

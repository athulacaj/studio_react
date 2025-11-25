# Portfolio Builder - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (Portfolio Builder Page)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      STEPPER NAVIGATION                         │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐            │
│  │Step 1│→ │Step 2│→ │Step 3│→ │Step 4│→ │Step 5│            │
│  │Basic │  │Design│  │Content│ │Gallery│ │Preview│            │
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CONTEXT STATE MANAGEMENT                     │
│              (PortfolioBuilderContext)                          │
│                                                                 │
│  • Portfolio Data State                                        │
│  • Loading States                                              │
│  • Error Handling                                              │
│  • CRUD Operations                                             │
└───────────┬─────────────────────────────┬──────────────────────┘
            │                             │
            ▼                             ▼
┌───────────────────────┐    ┌────────────────────────────────┐
│   FIREBASE SERVICES   │    │     GEMINI AI SERVICES        │
│                       │    │                                │
│  ┌─────────────────┐ │    │  ┌──────────────────────────┐ │
│  │  Firestore DB   │ │    │  │  Design Generation       │ │
│  │  • Portfolios   │ │    │  │  • Color Palettes        │ │
│  │  • Templates    │ │    │  │  • Layout Suggestions    │ │
│  └─────────────────┘ │    │  └──────────────────────────┘ │
│                       │    │                                │
│  ┌─────────────────┐ │    │  ┌──────────────────────────┐ │
│  │  Storage        │ │    │  │  Content Generation      │ │
│  │  • Images       │ │    │  │  • Bios                  │ │
│  │  • Assets       │ │    │  │  • About Sections        │ │
│  └─────────────────┘ │    │  │  • SEO Descriptions      │ │
│                       │    │  └──────────────────────────┘ │
│  ┌─────────────────┐ │    │                                │
│  │  Authentication │ │    └────────────────────────────────┘
│  │  • User Auth    │ │
│  └─────────────────┘ │
│                       │
│  ┌─────────────────┐ │
│  │  Analytics      │ │
│  └─────────────────┘ │
└───────────────────────┘
```

## Component Hierarchy

```
App.jsx
├── ThemeProvider
├── PhotoProofingProvider
└── PortfolioBuilderProvider
    └── PortfolioBuilderPage
        ├── Stepper
        └── Step Content
            ├── BasicInfoStep
            │   ├── TextField (Name, Email, Phone, etc.)
            │   └── Select (Photography Styles)
            │
            ├── DesignStep
            │   ├── Layout Selector
            │   ├── Color Scheme Selector
            │   ├── Mood Selector
            │   └── AI Design Button → Gemini AI
            │
            ├── ContentStep
            │   ├── Bio TextField
            │   ├── About TextField
            │   ├── Achievements TextField
            │   └── AI Content Button → Gemini AI
            │
            ├── GalleryStep
            │   ├── Upload Button → Firebase Storage
            │   ├── Image Grid
            │   └── Edit Dialog
            │
            └── PreviewStep
                ├── View Mode Toggle (Desktop/Mobile)
                ├── Tab Navigation
                └── Portfolio Preview
                    ├── Home Tab
                    ├── Gallery Tab
                    └── About Tab
```

## Data Flow

```
┌──────────────┐
│  User Input  │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│  Component State │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐      ┌─────────────┐
│  Context Update  │─────→│  AI Process │ (Optional)
└──────┬───────────┘      └─────┬───────┘
       │                        │
       │←───────────────────────┘
       │
       ▼
┌──────────────────┐
│  Firebase Save   │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Live Preview    │
└──────────────────┘
```

## AI Integration Flow

```
User Clicks "AI Generate"
         │
         ▼
┌─────────────────────┐
│  Collect User Data  │
│  • Photography Style│
│  • Preferences      │
│  • Basic Info       │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Build AI Prompt    │
│  • Structured JSON  │
│  • Context-aware    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Call Gemini API    │
│  • gemini-pro model │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Parse Response     │
│  • Extract JSON     │
│  • Validate Data    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  Update UI          │
│  • Show Results     │
│  • Apply Suggestions│
└─────────────────────┘
```

## Firebase Storage Structure

```
portfolios/
├── {timestamp}_{filename1}.jpg
├── {timestamp}_{filename2}.jpg
└── {timestamp}_{filename3}.jpg
```

## Firestore Database Structure

```
portfolios/
└── {userId}/
    ├── userId: string
    ├── basicInfo: {
    │   name, email, phone, location,
    │   website, photographyStyles[],
    │   experience, tagline
    │   }
    ├── design: {
    │   layout, colorScheme, mood,
    │   customColors{}, aiGenerated
    │   }
    ├── content: {
    │   bio, aboutSection, tagline,
    │   metaDescription, achievements, services
    │   }
    ├── gallery: [{
    │   url, fileName, title,
    │   description, category, uploadedAt
    │   }]
    ├── createdAt: timestamp
    ├── updatedAt: timestamp
    └── published: boolean

templates/
└── {templateId}/
    ├── name: string
    ├── description: string
    ├── preview: string
    ├── config: {}
    └── active: boolean
```

## Security Model

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authentication │ ← Firebase Auth
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Authorization  │ ← Firestore Rules
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Data Access    │
└─────────────────┘

Rules:
• Read: Public (published portfolios)
• Write: Authenticated users (own portfolio only)
• Storage: Authenticated users only
```

## Technology Stack Layers

```
┌──────────────────────────────────────┐
│         Presentation Layer           │
│  React 19 + Material-UI + Framer    │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│         Application Layer            │
│  Context API + React Hooks           │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│         Service Layer                │
│  Firebase SDK + Gemini AI SDK        │
└──────────────┬───────────────────────┘
               │
┌──────────────┴───────────────────────┐
│         Infrastructure Layer         │
│  Firebase Cloud + Google AI          │
└──────────────────────────────────────┘
```

## Key Design Patterns

1. **Provider Pattern**: Context API for state management
2. **Wizard Pattern**: Step-by-step user flow
3. **Repository Pattern**: Firebase data access abstraction
4. **Observer Pattern**: Real-time data updates
5. **Strategy Pattern**: Multiple layout/design options
6. **Factory Pattern**: AI content generation

## Performance Optimizations

- Lazy loading of images
- Debounced AI API calls
- Optimistic UI updates
- Image compression before upload
- Firestore query optimization
- React.memo for expensive components

---

This architecture ensures:
✅ Scalability
✅ Maintainability
✅ Security
✅ Performance
✅ User Experience

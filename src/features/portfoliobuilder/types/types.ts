export interface EventLocation {
  name: string;
  url: string;
  desc: string;
}

export interface EventDetail {
  type: string;
  time: string;
  location: EventLocation;
}

export interface GalleryItem {
  url: string;
}

export interface HeroImage {
  url: string;
}

export interface TextWithStyle {
  value: string;
  style?: {
    color?: string;
  };
}

export interface WeddingFormData {
  nav_logo: TextWithStyle;
  name1: TextWithStyle;
  name2: TextWithStyle;
  heroImage: HeroImage;
  mainDate: TextWithStyle;
  story: TextWithStyle;
  invitationHeading: TextWithStyle;
  invitationDescription: TextWithStyle;
  details: EventDetail[];
  gallery: GalleryItem[];
}

export interface EventPortfolio {
  id?: string;
  projectId?: string;
  eventType: 'wedding';
  eventPath: string;
  templateId: string;
  data: WeddingFormData;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
  published: boolean;
}

export const TEMPLATES = [
  { id: 'template1', name: 'Classic Elegance', description: 'A light, timeless design with warm earth tones' },
  { id: 'template2', name: 'Midnight Gold', description: 'A luxurious dark theme with gold accents' },
  { id: 'template3', name: 'Garden Romance', description: 'A botanical-inspired warm theme with blush tones' },
] as const;

export const DEFAULT_WEDDING_DATA: WeddingFormData = {
  nav_logo: { value: 'A & C', style: { color: '#0f1a2e' } },
  name1: { value: 'Alan', style: { color: '#0f1a2e' } },
  name2: { value: 'Celeste', style: { color: '#0f1a2e' } },
  heroImage: {
    url: 'https://lh3.googleusercontent.com/d/1kOiThRa1Ebfnb0d-0SESU0DhT2ZA9Woj=w1920?authuser=0',
  },
  mainDate: { value: 'Saturday, June 21, 2025', style: { color: '#0f1a2e' } },
  story: { value: '' },
  invitationHeading: { value: 'We invite you to celebrate our union', style: { color: '#0f1a2e' } },
  invitationDescription: { value: 'In the presence of family and friends, join us as we exchange vows and begin our new chapter together in the heart of Napa Valley.', style: { color: '#0f1a2e' } },
  details: [
    {
      type: 'ceremony',
      time: '4:00 PM',
      location: {
        name: 'The Glass House<br />123 Orchard Lane, Napa Valley',
        url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8427684627375!2d76.3275993751923!3d10.042023890009202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d326bf7e74f%3A0xf39975a981f18bbc!2sSt.%20Antony\'s%20Church%2C%20Thirumeni!5e0!3m2!1sen!2sin!4v1764235192436!5m2!1sen!2sin',
        desc: 'The Glass House is located nestled among the rolling hills of Napa.',
      },
    },
    {
      type: 'reception',
      time: '5:30 PM',
      location: {
        name: 'Kokkadvu',
        url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8427684627375!2d76.3275993751923!3d10.042023890009202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d326bf7e74f%3A0xf39975a981f18bbc!2sSt.%20Antony\'s%20Church%2C%20Thirumeni!5e0!3m2!1sen!2sin!4v1764235192436!5m2!1sen!2sin',
        desc: 'Kokkadvu is located nestled among the rolling hills of Napa.',
      },
    },
  ],
  gallery: [
    { url: 'https://lh3.googleusercontent.com/d/1m3ljRYn4ld2nY4B-ivO5D7701u28P4WG=w1920?authuser=0' },
    { url: 'https://lh3.googleusercontent.com/d/1Y_NiBM0KYCuYQoEO18MyhVbUyYCwDc3m=w1920?authuser=0' },
    { url: 'https://lh3.googleusercontent.com/d/1tUSIOnBxwkEY0XqVbLmo4Nsudli98ny5=w1920?authuser=0' },
  ],
};

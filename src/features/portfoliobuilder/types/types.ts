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

export interface WeddingFormData {
  name1: string;
  name2: string;
  heroImage: HeroImage;
  mainDate: string;
  story: string;
  invitationHeading: string;
  invitationDescription: string;
  details: EventDetail[];
  gallery: GalleryItem[];
}

export interface EventPortfolio {
  id?: string;
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
  name1: 'Alan',
  name2: 'Celeste',
  heroImage: {
    url: 'https://lh3.googleusercontent.com/d/1kOiThRa1Ebfnb0d-0SESU0DhT2ZA9Woj=w1920?authuser=0',
  },
  mainDate: 'Saturday, June 21, 2025',
  story: 'Celeste and Alan met in college and instantly clicked. They bonded over their shared love of adventure and travel, and soon found themselves inseparable. After graduation, they embarked on a journey to explore the world together, creating memories that would last a lifetime.',
  invitationHeading: 'We invite you to celebrate our union',
  invitationDescription: 'In the presence of family and friends, join us as we exchange vows and begin our new chapter together in the heart of Napa Valley.',
  details: [
    {
      type: 'ceremony',
      time: '4:00 PM',
      location: {
        name: 'The Glass House<br />123 Orchard Lane, Napa Valley',
        url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8427684627375!2d76.3275993751923!3d10.042023890009202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d326bf7e74f%3A0xf39975a981f18bbc!2sSt.%20Antony\'s%20Church%2C%20Thirumeni!5e0!3m2!1sen!2sin!4v1764235192436!5m2!1sen!2sin',
        desc: 'The Glass House is located nestled among the rolling hills of Napa. We recommend arriving 20 minutes early to enjoy the garden view before the ceremony begins.',
      },
    },
    {
      type: 'reception',
      time: '5:30 PM',
      location: {
        name: 'Kokkadvu',
        url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.8427684627375!2d76.3275993751923!3d10.042023890009202!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080d326bf7e74f%3A0xf39975a981f18bbc!2sSt.%20Antony\'s%20Church%2C%20Thirumeni!5e0!3m2!1sen!2sin!4v1764235192436!5m2!1sen!2sin',
        desc: 'Kokkadvu is located nestled among the rolling hills of Napa. We recommend arriving 20 minutes early to enjoy the garden view before the ceremony begins.',
      },
    },
  ],
  gallery: [
    { url: 'https://lh3.googleusercontent.com/d/1m3ljRYn4ld2nY4B-ivO5D7701u28P4WG=w1920?authuser=0' },
    { url: 'https://lh3.googleusercontent.com/d/1Y_NiBM0KYCuYQoEO18MyhVbUyYCwDc3m=w1920?authuser=0' },
    { url: 'https://lh3.googleusercontent.com/d/1tUSIOnBxwkEY0XqVbLmo4Nsudli98ny5=w1920?authuser=0' },
  ],
};

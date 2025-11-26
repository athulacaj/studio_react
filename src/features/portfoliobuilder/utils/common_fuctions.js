function getDemoData() {
       const demoData = {
            basicInfo: {
                name: 'Alex Morgan',
                email: 'alex.morgan@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                website: 'https://alexmorgan.photography',
                domain: `alexmorgan-${Math.floor(Math.random() * 10000)}`,
                photographyStyles: ['Wedding', 'Portrait', 'Landscape'],
                experience: '8',
                tagline: 'Capturing Life\'s Beautiful Moments Through My Lens'
            },
            design: {
                layout: 'masonry',
                colorScheme: 'dark',
                mood: 'Elegant',
                customColors: null,
                aiGenerated: false
            },
            content: {
                bio: 'Award-winning photographer specializing in wedding and portrait photography with over 8 years of experience creating timeless memories.',
                aboutSection: 'Hello! I\'m Alex Morgan, a passionate photographer based in San Francisco. My journey into photography began 8 years ago, and since then, I\'ve had the privilege of capturing countless beautiful moments.\n\nI specialize in wedding and portrait photography, but I also love exploring landscape photography during my travels. My approach is to blend artistic vision with authentic emotion, creating images that tell your unique story.\n\nWhen I\'m not behind the camera, you can find me exploring new locations, experimenting with new techniques, or teaching photography workshops to aspiring photographers.',
                tagline: 'Capturing Life\'s Beautiful Moments Through My Lens',
                metaDescription: 'Alex Morgan - Professional Wedding & Portrait Photographer in San Francisco. Award-winning photography services with 8 years of experience.',
                achievements: '• Winner of Best Wedding Photographer 2023\n• Featured in Photography Magazine\n• Over 200 weddings captured\n• Published in National Geographic',
                services: '• Wedding Photography\n• Engagement Sessions\n• Portrait Photography\n• Family Photos\n• Event Coverage\n• Photo Editing & Retouching'
            },
            gallery: [
                {
                    url: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800',
                    fileName: 'demo_wedding_1.jpg',
                    title: 'Sunset Wedding Ceremony',
                    description: 'Beautiful outdoor wedding at golden hour',
                    category: 'Wedding',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
                    fileName: 'demo_portrait_1.jpg',
                    title: 'Natural Light Portrait',
                    description: 'Studio portrait with natural lighting',
                    category: 'Portrait',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800',
                    fileName: 'demo_landscape_1.jpg',
                    title: 'Mountain Vista',
                    description: 'Breathtaking mountain landscape at sunrise',
                    category: 'Landscape',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
                    fileName: 'demo_wedding_2.jpg',
                    title: 'First Dance',
                    description: 'Romantic first dance moment',
                    category: 'Wedding',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
                    fileName: 'demo_portrait_2.jpg',
                    title: 'Candid Moment',
                    description: 'Genuine smile captured in the moment',
                    category: 'Portrait',
                    uploadedAt: new Date().toISOString()
                },
                {
                    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                    fileName: 'demo_landscape_2.jpg',
                    title: 'Coastal Sunset',
                    description: 'Dramatic coastal landscape',
                    category: 'Landscape',
                    uploadedAt: new Date().toISOString()
                }
            ]
        };
    return demoData;   
}

export {getDemoData}
import type { TrendIntelligence } from '@/types/trend-intelligence'

export const DEMO_TREND_INTELLIGENCE: TrendIntelligence[] = [
  {
    id: 'demo-1',
    title: 'POV: Du optimierst deinen Morgen in 60 Sekunden',
    platform: 'TikTok',
    views: '2.4M',
    likes: '312K',
    engagement: '9.8%',
    engagementRate: '9.8%',
    description:
      'Kurze POV-Clips mit Before/After-Hook. Hohe Watch-Time durch schnelle Schnitte und relatable Alltagsszenen.',
    gradientFrom: 'from-violet-600',
    gradientTo: 'to-fuchsia-600',
    viralScore: 91,
    trendVelocity: 'rising',
    hashtags: ['#morningroutine', '#productivity', '#pov', '#5amclub'],
    engagementPrediction: '9.2–11.5 % Engagement in den nächsten 72h bei konsistentem Posting.',
    contentIdeas: [
      '„60-Sekunden Morning Stack" — 3 Quick-Wins mit Text-Overlay.',
      'Duet-Format: Reaktion auf Top-Creator in der Nische.',
    ],
    hookSuggestions: [
      '„Ich hab 30 Tage diese Morgen-Routine getestet — das Ergebnis ist wild."',
      '„POV: Du wachst endlich ohne Snooze auf."',
    ],
    creatorInspiration: '@productivity.tok · Jump-Cuts, Front-Cam, lo-fi Beat',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1495364141860-b0d03eccd065?w=720&h=1280&fit=crop&q=80',
    videoUrl:
      'https://videos.pexels.com/video-files/6774633/6774633-hd_1080_1920_25fps.mp4',
    videoDuration: '0:58',
    creator: {
      handle: '@productivity.tok',
      displayName: 'Lena · Productivity',
      avatarUrl:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&q=80',
      followers: '842K',
      verified: true,
    },
    hookAnalysis: {
      hookType: 'POV + Transformation',
      hookText: '„POV: Du wachst endlich ohne Snooze auf."',
      hookScore: 94,
      whyItWorks:
        'POV-Format erzeugt sofortige Identifikation. Transformation-Hook in Sekunde 1 hält 78 % der Viewer über 3 Sekunden.',
      retentionTrigger: 'Before/After-Cut bei Sekunde 4 — starker Pattern Interrupt',
    },
    contentBreakdown: {
      format: 'Front-Cam POV · 9:16 · 45–60s',
      pacing: 'Schnelle Jump-Cuts alle 1.5s, Text-Overlay synchron zum Beat',
      audioTrend: 'Lo-fi „Morning Motivation" — +340 % Nutzung diese Woche',
      visualStyle: 'Warm tones, natürliches Licht, authentisch unpoliert',
      ctaStrategy: 'Soft CTA: „Speichern für morgen" — hohe Save-Rate',
      bestPostTime: 'Di–Do · 06:30–08:00 Uhr (Peak DACH)',
    },
    externalUrl: 'https://www.tiktok.com',
    niche: 'Productivity',
    isDemo: true,
  },
  {
    id: 'demo-2',
    title: 'Quiet Luxury Capsule — 5 Looks, 1 Woche',
    platform: 'Instagram',
    views: '1.1M',
    likes: '89K',
    engagement: '7.2%',
    engagementRate: '7.2%',
    description:
      'Ästhetische Carousel + Reel-Kombi. Save-Rate hoch durch minimalistische Farbpalette und Outfit-Listen.',
    gradientFrom: 'from-rose-500',
    gradientTo: 'to-orange-600',
    viralScore: 84,
    trendVelocity: 'peak',
    hashtags: ['#quietluxury', '#capsulewardrobe', '#reels', '#ootd'],
    engagementPrediction: '6.8–8.1 % — starke Save-Rate, moderate Comment-Spikes.',
    contentIdeas: [
      'Carousel: 5 Looks mit Preis-Range und Shop-Links.',
      'Reel: 7-Sekunden Transition zwischen Looks.',
    ],
    hookSuggestions: ['„5 Outfits, 1 Woche — ohne neuen Kauf."'],
    creatorInspiration: '@stylecapsule · Soft lighting, neutral tones, slow zoom',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1483985988355-763728e786a7?w=720&h=1280&fit=crop&q=80',
    videoUrl:
      'https://videos.pexels.com/video-files/3981768/3981768-hd_1080_1920_25fps.mp4',
    videoDuration: '0:24',
    creator: {
      handle: '@stylecapsule',
      displayName: 'Mira · Style Capsule',
      avatarUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&q=80',
      followers: '1.2M',
      verified: true,
    },
    hookAnalysis: {
      hookType: 'Listicle + Aesthetic Reveal',
      hookText: '„5 Outfits, 1 Woche — ohne neuen Kauf."',
      hookScore: 87,
      whyItWorks:
        'Konkrete Zahl (5) + Constraint (1 Woche) erzeugen Neugier. Quiet-Luxury-Ästhetik triggert Save-Verhalten.',
      retentionTrigger: 'Outfit-Transition bei Sekunde 2 mit Match-Cut',
    },
    contentBreakdown: {
      format: 'Reel · 4:5 / 9:16 · 15–30s',
      pacing: 'Langsamer Zoom, 2s pro Look, sanfte Übergänge',
      audioTrend: 'Ambient Jazz Remix — trending auf Instagram Reels',
      visualStyle: 'Neutral palette, soft shadows, minimalistisch',
      ctaStrategy: '„Speichern für Inspiration" + Link-in-Bio Shop',
      bestPostTime: 'So–Di · 18:00–21:00 Uhr',
    },
    externalUrl: 'https://www.instagram.com',
    niche: 'Fashion',
    isDemo: true,
  },
  {
    id: 'demo-3',
    title: 'Dieser Skincare-Hack wird gerade überall kopiert',
    platform: 'TikTok',
    views: '3.8M',
    likes: '521K',
    engagement: '11.4%',
    engagementRate: '11.4%',
    description:
      'Problem-Solution-Format mit Dermatology-ähnlichem Authority-Hook. Hohe Share-Rate in Gen Z.',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-600',
    viralScore: 94,
    trendVelocity: 'rising',
    hashtags: ['#skintok', '#skincare', '#beautyhacks', '#glowup'],
    engagementPrediction: '10.5–12.8 % — hohes Share- und Comment-Volumen erwartet.',
    contentIdeas: [
      '„3 Schritte, 1 Produkt" — Myth-Busting Opener.',
      'Before/After mit Disclaimer und 7-Tage-Tracker.',
    ],
    hookSuggestions: [
      '„Dermatologen hassen diesen Trick — ich zeig dir warum."',
    ],
    creatorInspiration: '@skintok · Close-up, ring light, science-style captions',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=720&h=1280&fit=crop&q=80',
    videoUrl:
      'https://videos.pexels.com/video-files/7692769/7692769-hd_1080_1920_25fps.mp4',
    videoDuration: '1:12',
    creator: {
      handle: '@skintok',
      displayName: 'Dr. SkinTok',
      avatarUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=128&h=128&fit=crop&q=80',
      followers: '2.1M',
      verified: true,
    },
    hookAnalysis: {
      hookType: 'Authority + Controversy',
      hookText: '„Dermatologen hassen diesen Trick — ich zeig dir warum."',
      hookScore: 96,
      whyItWorks:
        'Authority-Framing + leichte Kontroverse erzeugt sofortigen Comment-Trigger. Problem-Solution hält Watch-Time hoch.',
      retentionTrigger: 'Close-up Product Reveal bei Sekunde 3',
    },
    contentBreakdown: {
      format: 'Talking Head + B-Roll · 9:16 · 60–90s',
      pacing: 'Hook 0–3s, Problem 3–10s, Solution 10–45s',
      audioTrend: 'Original Voice-over — kein Trending Audio nötig',
      visualStyle: 'Ring light, close-up, science-style Text-Overlays',
      ctaStrategy: '„Folgen für mehr Skincare-Science" — Follow-CTA',
      bestPostTime: 'Mi–Fr · 19:00–22:00 Uhr',
    },
    externalUrl: 'https://www.tiktok.com',
    niche: 'Beauty',
    isDemo: true,
  },
  {
    id: 'demo-4',
    title: 'Side Hustle ohne Startkapital — so geht\u2019s',
    platform: 'TikTok',
    views: '1.9M',
    likes: '198K',
    engagement: '8.9%',
    engagementRate: '8.9%',
    description:
      'Listicle-Format mit konkreten Zahlen. CTA zu Link-in-Bio performt stark bei Business-Nischen.',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-yellow-600',
    viralScore: 88,
    trendVelocity: 'stable',
    hashtags: ['#sidehustle', '#makemoneyonline', '#entrepreneur', '#passiveincome'],
    engagementPrediction: '8.0–9.5 % — hohe Watch-Time bei 45–60s Videos.',
    contentIdeas: [
      '„3 Side Hustles unter 50 € Start" mit Screen-Recording.',
      'Storytime: Erster 1.000-€-Monat in 90 Tagen.',
    ],
    hookSuggestions: [
      '„Ich hab mit 0 € gestartet — das ist mein erster Verdienst."',
    ],
    creatorInspiration: '@hustlelab · Screen cap + face cam split, bold subtitles',
    thumbnailUrl:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=720&h=1280&fit=crop&q=80',
    videoUrl:
      'https://videos.pexels.com/video-files/3129671/3129671-hd_1080_1920_25fps.mp4',
    videoDuration: '0:47',
    creator: {
      handle: '@hustlelab',
      displayName: 'Max · Hustle Lab',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&q=80',
      followers: '567K',
      verified: false,
    },
    hookAnalysis: {
      hookType: 'Social Proof + Specific Numbers',
      hookText: '„Ich hab mit 0 € gestartet — das ist mein erster Verdienst."',
      hookScore: 89,
      whyItWorks:
        'Konkrete Zahl (0 €) senkt Einstiegshürde. Screen-Recording als Proof erhöht Glaubwürdigkeit.',
      retentionTrigger: 'Earnings-Screenshot Reveal bei Sekunde 8',
    },
    contentBreakdown: {
      format: 'Split-Screen · Face Cam + Screen Recording · 9:16',
      pacing: 'Listicle: 3 Punkte à 12s, bold Subtitles',
      audioTrend: 'Motivational Beat — „Grind Mode" Playlist',
      visualStyle: 'Bold yellow subtitles, dark mode UI, high contrast',
      ctaStrategy: 'Link-in-Bio Free Guide — Conversion-optimiert',
      bestPostTime: 'Mo–Mi · 12:00–14:00 & 20:00–22:00 Uhr',
    },
    externalUrl: 'https://www.tiktok.com',
    niche: 'Business',
    isDemo: true,
  },
]

# 🎵 FlowForge - Freestyle Practice App

A beautiful, minimal freestyle rap practice application with iOS-inspired design and purple gradient theming.

![FlowForge](https://img.shields.io/badge/FlowForge-v2.0-purple?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-cyan?style=for-the-badge&logo=tailwindcss)

---

## ✨ Features

### 🎨 Beautiful Design
- **Dark theme** with pure black background for OLED screens
- **Purple gradient** accent colors throughout
- **Glassmorphism** effects on cards and overlays
- **Smooth animations** for all interactions
- **iOS-inspired** circular timer with progress ring

### 🎵 Practice Tools
- **50+ curated beats** with BPM and genre tags
- **1,000+ word bank** organized by difficulty
- **Customizable difficulty** slider (Easy → Medium → Hard)
- **Adjustable frequency** slider (4 → 8 → 16 bars)
- **2-minute sessions** with automatic recording
- **Real-time word prompts** synchronized to beat

### 📱 User Experience
- **3-page onboarding flow** for focused experience
- **Page progress indicators** at bottom
- **Smooth page transitions** with fade animations
- **Touch-friendly** design for mobile devices
- **Responsive layout** for all screen sizes

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/flowforge.git

# Navigate to directory
cd flowforge

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

---

## 📖 How to Use

### 1️⃣ How It Works Page
- Read about FlowForge features
- See statistics (50+ beats, 1,000+ words)
- Click **"Start Practicing"** to begin

### 2️⃣ Beat Selector Page
- Browse grid of 8 beats
- Click a beat to select (purple highlight)
- See BPM, genre, and premium status
- Click **"Continue to Practice"**

### 3️⃣ Player Page
- **Configure your session**:
  - Adjust difficulty slider for word complexity
  - Adjust frequency slider for word timing
- **Start practicing**:
  - Click purple Play button
  - Timer counts down from 2:00
  - Words appear at set intervals
  - Recording indicator pulses red
- **Stop anytime** with red Stop button

---

## 🎯 Page Structure

```
flowforge/
├── App.tsx                        # Main app with page routing
├── components/
│   ├── HowItWorksPage.tsx        # Landing page
│   ├── BeatSelectorPage.tsx      # Beat selection
│   ├── PlayerPage.tsx            # Practice session
│   └── ui/
│       ├── button.tsx            # Button component
│       ├── slider.tsx            # Custom slider
│       └── ...                   # Other UI components
├── styles/
│   └── globals.css               # Purple theme colors
├── README.md                     # This file
├── WHATS_NEW.md                  # Redesign changelog
└── REDESIGN_NOTES.md             # Detailed documentation
```

---

## 🎨 Design System

### Colors
```css
Purple-500: #a855f7  /* Primary accent */
Purple-600: #9333ea  /* Hover states */
Violet-500: #7D7AFF  /* Secondary accent */
Red-500: #ef4444     /* Recording/stop */
Green-500: #22c55e   /* Easy difficulty */
```

### Typography
- Logo: "Flow**Forge**" (Forge in purple)
- Headings: Sans-serif, light weight
- Body: 14-16px, normal weight
- Timer: 48px, light weight

### Spacing
- Cards: 24px border radius
- Buttons: Full rounded (pill)
- Padding: 16-32px consistent
- Gaps: 16-24px between elements

---

## 🔧 Customization

### Add New Beats
Edit `/components/BeatSelectorPage.tsx`:

```typescript
const BEATS: Beat[] = [
  {
    id: '9',
    title: 'Your Beat Name',
    artist: 'Artist Name',
    bpm: 95,
    genre: 'Trap',
    audioUrl: '/path/to/audio.mp3',
    isPremium: false
  },
  // ... more beats
];
```

### Add New Words
Edit `/components/PlayerPage.tsx`:

```typescript
const WORD_BANK = {
  easy: ['your', 'easy', 'words'],
  medium: ['medium', 'words'],
  hard: ['difficult', 'words']
};
```

### Change Theme Colors
Edit `/styles/globals.css`:

```css
:root {
  --primary: #a855f7; /* Change to your color */
  --accent: #7D7AFF;  /* Change to your color */
}
```

---

## 📱 Android Packaging

### Option 1: Capacitor (Recommended)

```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize
npx cap init FlowForge com.yourname.flowforge

# Build web app
npm run build

# Add Android platform
npx cap add android

# Open in Android Studio
npx cap open android
```

Then build APK in Android Studio.

### Option 2: Test on Mobile

```bash
# Start dev server
npm run dev

# Find your local IP
# Windows: ipconfig
# Mac/Linux: ifconfig

# Open on phone
# http://YOUR_IP:5173
```

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Vite** - Build tool
- **Lucide React** - Icons
- **Radix UI** - Slider component

---

## 📚 Documentation

- `README.md` - This file (getting started)
- `WHATS_NEW.md` - Redesign changelog
- `REDESIGN_NOTES.md` - Complete technical documentation

---

## 🎯 Roadmap

- [ ] Add real audio playback
- [ ] Implement actual microphone recording
- [ ] Save recordings to device storage
- [ ] Add session history
- [ ] User authentication
- [ ] Premium beats integration
- [ ] Progress tracking
- [ ] Social sharing features

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Credits

- **Design inspired by**: iOS Clock App, Revolut
- **Color palette**: Material You guidelines
- **Icons**: Lucide React
- **UI components**: Radix UI

---

## 📞 Support

Need help? Have questions?

- 📧 Email: support@flowforge.app
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/flowforge/issues)
- 💬 Discord: [Join our server](#)

---

**Made with ❤️ for freestyle artists everywhere**

---

## 🎉 Quick Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
```

---

## 📸 Screenshots

### Page 1: How It Works
- Feature cards with numbered steps
- Detailed feature descriptions
- Statistics footer

### Page 2: Beat Selector
- Grid of beats with titles and BPM
- Premium badges
- Selection highlighting

### Page 3: Player
- Circular timer with progress
- Difficulty/frequency sliders
- Large word prompts
- Recording indicator

---

## 🌟 Key Features Explained

### Circular Timer
- 200px diameter SVG circle
- Smooth stroke-dashoffset animation
- Purple gradient progress ring
- Real-time countdown display

### Word Prompts
- 1,000+ words organized by difficulty
- Fade-in animation on appearance
- Purple gradient text effect
- Uppercase styling with wide tracking

### Beat Synchronization
- Calculates bar duration from BPM
- Words appear on exact musical bars
- Supports 4, 8, or 16 bar intervals
- Bar counter displayed during session

### Sliders
- Smooth 0-100 value range
- Purple gradient fill
- Live label updates
- White thumb with shadow

---

**FlowForge v2.0** - The freestyle command center 🎤

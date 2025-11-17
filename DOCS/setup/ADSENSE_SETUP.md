# Google AdSense Integration Guide

## Overview
Add non-intrusive banner ads for free-tier users in FlowForge.

## 1. AdSense Account Setup

1. Go to [google.com/adsense](https://www.google.com/adsense)
2. Sign up with your Google account
3. Add your website URL
4. Complete verification process (can take 1-2 days)
5. Once approved, get your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

## 2. Environment Variables

Add to `.env.local`:

```bash
# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

## 3. Implementation

### `components/ads/AdBanner.tsx`
```typescript
'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  responsive?: boolean
  className?: string
}

export function AdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdBannerProps) {
  const { data: session } = useSession()
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  // Don't show ads to Pro users
  const isPro = session?.user?.subscriptionStatus === 'active'

  useEffect(() => {
    if (!isPro && clientId) {
      try {
        // @ts-ignore
        ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      } catch (error) {
        console.error('AdSense error:', error)
      }
    }
  }, [isPro, clientId])

  // Don't render if user is Pro or no client ID
  if (isPro || !clientId) {
    return null
  }

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  )
}
```

### `app/layout.tsx` - Add AdSense Script
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  return (
    <html lang="en">
      <head>
        {adsenseId && (
          <>
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
              crossOrigin="anonymous"
            />
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
          </>
        )}
      </head>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

## 4. Ad Placement Strategy

### Recommended Placements

#### 1. Bottom Banner (Main Practice Screen)
```typescript
// app/practice/page.tsx
<div className="practice-container">
  {/* Main content */}
  <PlayButton />
  <WordPrompt />
  
  {/* Ad at bottom, non-intrusive */}
  <div className="mt-8">
    <AdBanner slot="1234567890" format="horizontal" />
  </div>
</div>
```

#### 2. Sidebar (Desktop Only)
```typescript
// components/layout/Sidebar.tsx
<aside className="hidden lg:block w-64">
  <AdBanner slot="0987654321" format="vertical" />
</aside>
```

#### 3. Between Sessions List
```typescript
// components/session/SessionList.tsx
<div className="space-y-4">
  {sessions.slice(0, 3).map(session => <SessionCard key={session.id} />)}
  
  <AdBanner slot="1122334455" format="rectangle" className="my-6" />
  
  {sessions.slice(3).map(session => <SessionCard key={session.id} />)}
</div>
```

## 5. Create Ad Units in AdSense

1. Go to AdSense Dashboard → Ads → By ad unit
2. Click "New ad unit"
3. Choose "Display ads"
4. Configure:
   - **Name**: FlowForge Bottom Banner
   - **Size**: Responsive
   - **Ad type**: Display ads
5. Click "Create"
6. Copy the `data-ad-slot` value
7. Repeat for each placement

### Recommended Ad Units

| Name | Size | Placement | Slot Variable |
|------|------|-----------|---------------|
| Bottom Banner | Responsive | Practice screen bottom | `NEXT_PUBLIC_AD_SLOT_BOTTOM` |
| Sidebar | 300x600 | Desktop sidebar | `NEXT_PUBLIC_AD_SLOT_SIDEBAR` |
| In-Feed | Responsive | Between sessions | `NEXT_PUBLIC_AD_SLOT_FEED` |

Update `.env.local`:
```bash
NEXT_PUBLIC_AD_SLOT_BOTTOM=1234567890
NEXT_PUBLIC_AD_SLOT_SIDEBAR=0987654321
NEXT_PUBLIC_AD_SLOT_FEED=1122334455
```

## 6. Styling

### `app/globals.css`
```css
/* Ad container styling */
.ad-container {
  @apply w-full flex justify-center items-center;
  @apply bg-gray-900/50 rounded-lg p-4;
  @apply border border-gray-800;
}

.ad-container ins {
  @apply min-h-[100px];
}

/* Responsive ad sizes */
@media (max-width: 768px) {
  .ad-container {
    @apply p-2;
  }
}

/* Loading state */
.ad-container:empty::before {
  content: 'Advertisement';
  @apply text-xs text-gray-600 uppercase tracking-wider;
}
```

## 7. Ad Policy Compliance

### Content Guidelines
- ✅ Original music/beats content
- ✅ User-generated content
- ✅ Educational content (practice tool)
- ❌ Copyrighted music without license
- ❌ Explicit/offensive content

### Technical Requirements
- ✅ Ads clearly labeled
- ✅ Not placed too close to interactive elements
- ✅ Not more than 3 ads per page
- ✅ Responsive design
- ❌ Ads in pop-ups
- ❌ Accidental clicks encouraged

## 8. Revenue Optimization

### Best Practices
1. **Placement**: Above the fold when possible
2. **Format**: Responsive ads perform best
3. **Density**: 1-2 ads per page for free tier
4. **User Experience**: Never block core functionality
5. **Testing**: A/B test placements

### Expected Revenue
- **RPM (Revenue Per Mille)**: $0.50 - $2.00
- **10,000 free users**: ~$5-$20/month
- **100,000 free users**: ~$50-$200/month

## 9. Testing

### Development
AdSense won't show ads on localhost. Test on:
- Vercel preview deployment
- Staging domain

### Verify Implementation
1. Deploy to staging
2. Open in incognito mode (not logged in as Pro)
3. Check browser console for errors
4. Verify ads load within 5 seconds
5. Check AdSense dashboard for impressions

## 10. Monitoring

### AdSense Dashboard Metrics
- **Impressions**: Ad views
- **Clicks**: User clicks on ads
- **CTR**: Click-through rate (aim for 0.5-2%)
- **RPM**: Revenue per 1000 impressions
- **Earnings**: Total revenue

### Set Up Alerts
1. Go to AdSense → Settings → Notifications
2. Enable alerts for:
   - Policy violations
   - Unusual activity
   - Payment issues

## 11. Pro User Experience

Ensure Pro users never see ads:

```typescript
// Middleware or layout check
const isPro = session?.user?.subscriptionStatus === 'active'

if (isPro) {
  // Don't load AdSense script
  // Don't render AdBanner components
}
```

## 12. Performance Optimization

### Lazy Load Ads
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

export function LazyAdBanner(props: AdBannerProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (inView) {
      setShouldRender(true)
    }
  }, [inView])

  return (
    <div ref={ref}>
      {shouldRender && <AdBanner {...props} />}
    </div>
  )
}
```

### Preconnect
Already added to layout:
```html
<link rel="preconnect" href="https://pagead2.googlesyndication.com" />
<link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
```

## 13. Common Issues

### Ads Not Showing
- Check AdSense account is approved
- Verify client ID is correct
- Check browser ad blockers
- Wait 24-48 hours after setup
- Check AdSense dashboard for policy issues

### Low Revenue
- Increase traffic
- Improve ad placement
- Test different ad sizes
- Ensure mobile-friendly
- Check for invalid clicks

### Policy Violations
- Review AdSense policies
- Remove violating content
- Appeal if necessary
- Monitor content quality

## 14. Alternative: Upgrade Prompts

Instead of/in addition to ads, show upgrade prompts:

```typescript
export function UpgradePrompt() {
  return (
    <div className="glass rounded-lg p-6 text-center">
      <h3 className="text-xl font-light mb-2">Remove Ads</h3>
      <p className="text-text-secondary mb-4">
        Upgrade to Pro for an ad-free experience
      </p>
      <UpgradeButton />
    </div>
  )
}
```

## 15. Rollout Checklist

- [ ] AdSense account approved
- [ ] Ad units created
- [ ] Environment variables set
- [ ] Ad components implemented
- [ ] Pro users excluded
- [ ] Tested on staging
- [ ] Policy compliance verified
- [ ] Performance optimized
- [ ] Monitoring set up
- [ ] Revenue tracking enabled


'use client'

import { useState, useEffect } from 'react'

export function useDynamicType() {
  const [textScale, setTextScale] = useState(100)
  const [isLargeText, setIsLargeText] = useState(false)

  useEffect(() => {
    const measureText = () => {
      // Create a test element
      const div = document.createElement('div')
      div.style.fontSize = '1rem' // Should be 16px by default
      div.style.position = 'absolute'
      div.style.left = '-9999px'
      div.innerText = 'Test'
      document.body.appendChild(div)

      const computed = window.getComputedStyle(div).fontSize
      const px = parseFloat(computed)
      document.body.removeChild(div)

      // Standard base is 16px
      // If user has system zoom, 1rem might be 20px (125%)
      const scale = (px / 16) * 100
      setTextScale(scale)
      setIsLargeText(scale > 130) // Threshold for "Safety Valve"
    }

    measureText()
    // Optional: Resize observer or listeners if we expect it to change live (rare)
  }, [])

  return { textScale, isLargeText }
}

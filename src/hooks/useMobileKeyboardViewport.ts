import { useEffect } from 'react'

const KEYBOARD_THRESHOLD_PX = 80

/**
 * Tracks Visual Viewport keyboard inset for stable mobile typing (iOS Safari).
 * Sets `--keyboard-height` and `.keyboard-open` on <html>.
 */
export function useMobileKeyboardViewport() {
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      const keyboardHeight = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      const open = keyboardHeight > KEYBOARD_THRESHOLD_PX

      document.documentElement.style.setProperty(
        '--keyboard-height',
        `${keyboardHeight}px`,
      )
      document.documentElement.classList.toggle('keyboard-open', open)
    }

    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()

    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
      document.documentElement.style.removeProperty('--keyboard-height')
      document.documentElement.classList.remove('keyboard-open')
    }
  }, [])
}

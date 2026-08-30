export function scrollToTop(smooth = false) {
  if (typeof window === 'undefined') return;

  // 1. Lenis smooth scroll instance
  try {
    const lenis = (window as any).__lenis;
    if (lenis && typeof lenis.scrollTo === 'function') {
      lenis.scrollTo(0, { immediate: !smooth });
    }
  } catch {
    // Ignore Lenis error if not initialized
  }

  // 2. Standard Window scrollTo
  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? 'smooth' : 'instant',
    });
  } catch {
    window.scrollTo(0, 0);
  }

  // 3. Fallback direct element scroll reset
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

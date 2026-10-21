/**
 * Safe external navigation helper that avoids window.open()
 * to comply with iframe security and popup blocker policies.
 */
export function openExternalUrl(url: string): void {
  if (typeof window === 'undefined' || !url) return;
  try {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch {
    window.location.href = url;
  }
}

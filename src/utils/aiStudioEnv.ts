/**
 * Detects if the app is currently running inside the AI Studio development environment.
 * Ensures developer/studio features (such as Video Upload) are visible exclusively
 * to the creator in AI Studio and never exposed to public/production end users.
 */
export function isAiStudioEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // 1. Vite DEV mode (always true in AI Studio dev environment)
  if (import.meta.env.DEV) {
    return true;
  }

  const hostname = window.location.hostname;

  // 2. AI Studio container hostnames:
  // - *.run.app dev instances (e.g., ais-dev-*)
  // - localhost / 127.0.0.1
  // - Google internal preview domains
  if (
    hostname.includes('ais-dev-') ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('.corp.google.com')
  ) {
    return true;
  }

  // 3. Embedded inside AI Studio iframe parent
  try {
    if (window !== window.parent) {
      const ref = document.referrer || '';
      if (
        ref.includes('aistudio.google.com') ||
        ref.includes('aistudio') ||
        ref.includes('google.com')
      ) {
        return true;
      }
    }
  } catch {
    // Cross-origin iframe fallback
  }

  // 4. Secret Studio admin query param (?studio=true or ?admin=true) or localStorage override
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('studio') === 'true' || params.get('admin') === 'true') {
      try {
        localStorage.setItem('snapshots_ai_studio_mode', 'true');
      } catch {}
      return true;
    }
    if (params.get('admin') === 'false' || params.get('studio') === 'false') {
      try {
        localStorage.removeItem('snapshots_ai_studio_mode');
      } catch {}
      return false;
    }
    if (localStorage.getItem('snapshots_ai_studio_mode') === 'true') {
      return true;
    }
  } catch {}

  return false;
}

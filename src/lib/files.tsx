import { useEffect, useState, ReactNode } from 'react';
import { resolveFileUrl } from '@/lib/api';

/** Resolves a stored file reference to a short-lived signed URL. */
export function useSignedUrl(ref: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    setUrl(null);
    if (ref) resolveFileUrl(ref).then(u => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [ref]);
  return url;
}

/** Opens a private document via a freshly signed URL at click time. */
export function SecureFileLink({ fileRef, className, children }: { fileRef: string; className?: string; children: ReactNode }) {
  const open = async () => {
    // Open synchronously (popup blockers), then drop the opener reference;
    // passing 'noopener' would make window.open return null.
    const w = window.open('', '_blank');
    if (w) w.opener = null;
    const url = await resolveFileUrl(fileRef);
    if (url && w) w.location.href = url;
    else w?.close();
  };
  return <button type="button" onClick={open} className={className}>{children}</button>;
}

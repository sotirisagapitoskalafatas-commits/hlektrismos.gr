/* Landing-page imagery.
   Every remote image loaded on page view hands the visitor's IP address and
   User-Agent to that host. Images are therefore served from
   src/assets/landing/ once present (run `npm run fetch:images`); the remote
   Pexels URL is only a fallback until the files are committed. */
const local = import.meta.glob('/src/assets/landing/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function pexels(id: number, width: number): string {
  return (
    local[`/src/assets/landing/pexels-${id}.jpg`] ??
    `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`
  );
}


/** True until the photos are committed locally; the privacy policy then lists Pexels as a recipient. */
export const usingRemoteImages = Object.keys(local).length === 0;

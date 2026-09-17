import { useEffect } from 'react';

import { imageUrl } from '../api.js';
import { CloseIcon } from '../icons.jsx';

// Full-size view of one image. The grid and chat thumbnails are deliberately
// small and letterboxed; this is the escape hatch for actually looking at a
// photo. Closes on Escape or a click outside the image.
export default function Lightbox({ path, onClose }) {
  useEffect(() => {
    if (!path) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    // Stop the page behind the overlay from scrolling while it's open.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [path, onClose]);

  if (!path) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'color-mix(in srgb, var(--color-neutral-900) 82%, transparent)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
        cursor: 'zoom-out',
      }}
    >
      <button
        onClick={onClose}
        className="btn btn-icon"
        aria-label="Close"
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'var(--color-bg)', color: 'var(--color-text)',
        }}
      >
        <CloseIcon width="17" height="17" />
      </button>

      <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <img
          src={imageUrl(path)}
          alt={path}
          // Clicking the image itself shouldn't dismiss — only the backdrop.
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain',
            borderRadius: 18, boxShadow: 'var(--shadow-lg)', cursor: 'default',
          }}
        />
        <figcaption style={{
          font: '11.5px ui-monospace, Menlo, monospace',
          color: 'var(--color-neutral-300)',
        }}>{path.split('/').pop()}</figcaption>
      </figure>
    </div>
  );
}

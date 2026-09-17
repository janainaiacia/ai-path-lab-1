import { useEffect, useState } from 'react';

import { ImageIcon, SearchIcon } from '../icons.jsx';

const MUTED = 'color-mix(in srgb, var(--color-text) 55%, transparent)';

export default function TopBar({ draft, onDraft, onSubmit, k, onK }) {
  // The handle's position while it's being dragged. A range input fires
  // onChange for every step of the drag, so searching there would fire a
  // request per step; this tracks the handle locally and only tells the parent
  // on release. Key-up is included so arrow keys still commit.
  const [sliding, setSliding] = useState(k);
  useEffect(() => setSliding(k), [k]);

  const commit = (e) => {
    const next = Number(e.target.value);
    if (next !== k) onK(next);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16, padding: '13px 20px',
      borderBottom: '1px solid var(--color-divider)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 2 }}>
        <div style={{
          width: 26, height: 26, borderRadius: '50%', background: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5ead8',
        }}>
          <ImageIcon width="15" height="15" />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        style={{
          flex: 1, maxWidth: 620, display: 'flex', alignItems: 'center', gap: 9,
          background: 'var(--color-surface)', border: '1px solid var(--color-divider)',
          borderRadius: 999, padding: '6px 6px 6px 15px',
        }}
      >
        <SearchIcon width="16" height="16" style={{ flex: 'none', color: 'var(--color-accent)' }} />
        <input
          value={draft}
          onChange={(e) => onDraft(e.target.value)}
          placeholder="Describe what you're looking for…"
          style={{
            flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none',
            font: '14.5px var(--font-body)', color: 'var(--color-text)',
            caretColor: 'var(--color-accent)',
          }}
        />
        <button type="submit" className="btn btn-primary"
                style={{ padding: '6px 17px', fontSize: 13, flex: 'none' }}>
          Search
        </button>
      </form>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '5px 14px',
        border: '1px solid var(--color-divider)', borderRadius: 999,
      }}>
        <span style={{
          font: '11px var(--font-body)', letterSpacing: '.06em', textTransform: 'uppercase',
          color: MUTED, whiteSpace: 'nowrap',
        }}>Top-K</span>
        <input type="range" className="rng" min="1" max="30" step="1"
               value={sliding}
               onChange={(e) => setSliding(Number(e.target.value))}
               onMouseUp={commit}
               onTouchEnd={commit}
               onKeyUp={commit}
               style={{ width: 96 }} />
        <span style={{ font: '700 13px ui-monospace, Menlo, monospace', width: 20, textAlign: 'right' }}>
          {sliding}
        </span>
      </div>
    </div>
  );
}

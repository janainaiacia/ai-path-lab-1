import { imageUrl } from '../api.js';
import { MaximizeIcon } from '../icons.jsx';

// Above this the score reads as a confident match, below the second threshold
// as a weak one. Mirrors the design's three-step colour ramp.
function scoreColor(score) {
  if (score > 0.7) return 'var(--color-accent-700)';
  if (score > 0.45) return 'var(--color-accent-2-700)';
  return 'var(--color-neutral-600)';
}

export default function ResultTile({ hit, rank, selected, onSelect, onMeasure, onZoom }) {
  return (
    <div className="tile" onClick={onSelect}
         style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div className="frame" style={{
        position: 'relative', borderRadius: 20, overflow: 'hidden',
        background: 'var(--color-neutral-200)', aspectRatio: '4/3',
        boxShadow: selected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        outline: selected ? '2.5px solid var(--color-accent)' : '0px solid transparent',
        outlineOffset: 2,
      }}>
        <img
          src={imageUrl(hit.path)}
          alt={hit.path}
          // The design shows pixel dimensions in the chat panel. Rather than a
          // server round trip, read them off the image the browser has loaded.
          onLoad={(e) => onMeasure(hit.path, e.target.naturalWidth, e.target.naturalHeight)}
        />
        <div style={{
          position: 'absolute', top: 8, left: 8, padding: '2px 8px', borderRadius: 999,
          background: 'rgba(32,30,29,.6)', color: '#f5ead8',
          font: '700 10.5px ui-monospace, Menlo, monospace',
        }}>#{rank}</div>

        {/* stopPropagation: the whole tile is a select target, so without it
            zooming would also change the chat panel's subject. */}
        <button
          className="zoom btn btn-icon"
          aria-label="View full size"
          onClick={(e) => { e.stopPropagation(); onZoom(hit.path); }}
          style={{
            position: 'absolute', top: 6, right: 6, width: 26, height: 26,
            background: 'rgba(32,30,29,.6)', color: '#f5ead8',
          }}
        >
          <MaximizeIcon width="13" height="13" />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
        <span style={{
          font: '700 13.5px ui-monospace, Menlo, monospace', color: scoreColor(hit.score),
        }}>{hit.score.toFixed(3)}</span>
      </div>
    </div>
  );
}

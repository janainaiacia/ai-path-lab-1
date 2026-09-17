const MUTED_52 = 'color-mix(in srgb, var(--color-text) 52%, transparent)';
const MUTED_48 = 'color-mix(in srgb, var(--color-text) 48%, transparent)';
const MUTED_45 = 'color-mix(in srgb, var(--color-text) 45%, transparent)';

export default function Sidebar({ history, query, onPick, indexSize }) {
  return (
    <div style={{
      width: 208, flex: 'none', borderRight: '1px solid var(--color-divider)',
      display: 'flex', flexDirection: 'column',
      background: 'color-mix(in srgb, var(--color-surface) 45%, transparent)',
    }}>
      <div style={{
        padding: '16px 16px 9px', font: '11px var(--font-body)', letterSpacing: '.09em',
        textTransform: 'uppercase', color: MUTED_52,
      }}>Recent searches</div>

      <div className="pane" style={{
        flex: 1, overflowY: 'auto', padding: '0 9px 12px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {history.map((h) => (
          <div
            key={h.q}
            className="hist"
            onClick={() => onPick(h.q)}
            style={{
              cursor: 'pointer', borderRadius: 14, padding: '8px 10px',
              display: 'flex', flexDirection: 'column', gap: 2,
              background: h.q === query
                ? 'color-mix(in srgb, var(--color-accent) 14%, transparent)'
                : 'transparent',
            }}
          >
            <span style={{ fontSize: 12.5, lineHeight: 1.3, textWrap: 'pretty' }}>{h.q}</span>
            <span style={{ font: '10.5px ui-monospace, Menlo, monospace', color: MUTED_48 }}>
              {h.meta}
            </span>
          </div>
        ))}

        {history.length === 0 && (
          <div style={{ padding: 10, font: '12px/1.5 var(--font-body)', color: MUTED_45 }}>
            Your queries will collect here.
          </div>
        )}
      </div>
    </div>
  );
}

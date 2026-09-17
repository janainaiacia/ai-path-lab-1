import { SearchIcon, SpinnerIcon, WarningIcon } from '../icons.jsx';
import ResultTile from './ResultTile.jsx';

const MUTED_55 = 'color-mix(in srgb, var(--color-text) 55%, transparent)';
const MUTED_62 = 'color-mix(in srgb, var(--color-text) 62%, transparent)';

const SUGGESTIONS = [
  'a dog running on a beach',
  'something red on a wooden table',
  'two people laughing outdoors',
  'an empty road at dusk',
];

const CENTERED = {
  height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
  justifyContent: 'center', textAlign: 'center', padding: '0 40px',
};

function Empty({ onSearch }) {
  return (
    <div style={CENTERED}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%', background: 'var(--color-accent-100)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        color: 'var(--color-accent)',
      }}>
        <SearchIcon width="40" height="40" />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 26 }}>Search images by meaning</h3>
      <p style={{ maxWidth: 430, fontSize: 14, lineHeight: 1.6, color: MUTED_62, textWrap: 'pretty' }}>
        Type a description. It&apos;s embedded with the same model as the index, then matched by
        cosine similarity — no filenames or tags needed.
      </p>
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 9, justifyContent: 'center',
        maxWidth: 520, marginTop: 8,
      }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} onClick={() => onSearch(s)} className="btn btn-secondary"
                  style={{ fontSize: 12.5, padding: '7px 15px' }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function Loading({ query, step }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <SpinnerIcon className="spin" width="17" height="17" style={{ color: 'var(--color-accent)' }} />
        <h3 style={{ margin: 0, fontSize: 23, letterSpacing: '-.015em' }}>“{query}”</h3>
      </div>
      <div style={{ font: '12.5px var(--font-body)', color: MUTED_55, marginBottom: 17 }}>{step}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <div className="skel" style={{ aspectRatio: '4/3', borderRadius: 20 }} />
            <div className="skel" style={{ height: 11, width: '58%', borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function NoResults({ query, onClear }) {
  return (
    <div style={CENTERED}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%', background: 'var(--color-neutral-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        color: 'var(--color-neutral-600)',
      }}>
        <SearchIcon width="38" height="38" />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 24 }}>Nothing came back</h3>
      <p style={{ maxWidth: 420, fontSize: 14, lineHeight: 1.6, color: MUTED_62, textWrap: 'pretty' }}>
        The index returned no vectors for “{query}”.
      </p>
      <button onClick={onClear} className="btn btn-secondary" style={{ fontSize: 13 }}>New search</button>
    </div>
  );
}

function Failed({ detail, onRetry, onClear }) {
  return (
    <div style={CENTERED}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%', background: 'var(--color-accent-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        color: 'var(--color-accent-700)',
      }}>
        <WarningIcon width="38" height="38" />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 24 }}>The retrieval service didn&apos;t answer</h3>
      <p style={{ maxWidth: 430, fontSize: 14, lineHeight: 1.6, color: MUTED_62, textWrap: 'pretty' }}>
        Your query wasn&apos;t lost — retry it, or check the service logs.
      </p>
      <div style={{
        font: '11px ui-monospace, Menlo, monospace',
        color: 'color-mix(in srgb, var(--color-text) 45%, transparent)',
        background: 'var(--color-surface)', borderRadius: 999, padding: '6px 14px',
        marginBottom: 14, maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis',
      }}>GET /api/search · {detail}</div>
      <div style={{ display: 'flex', gap: 9 }}>
        <button onClick={onRetry} className="btn btn-primary" style={{ fontSize: 13 }}>Retry search</button>
        <button onClick={onClear} className="btn btn-secondary" style={{ fontSize: 13 }}>Dismiss</button>
      </div>
    </div>
  );
}

export default function ResultsPane({
  view, query, hits, total, selected, error, loadStep,
  onSearch, onSelect, onClear, onMeasure, onZoom,
}) {
  return (
    <div className="pane" style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 22px 26px' }}>
      {view === 'empty' && <Empty onSearch={onSearch} />}
      {view === 'loading' && <Loading query={query} step={loadStep} />}
      {view === 'error' && <Failed detail={error} onRetry={() => onSearch(query)} onClear={onClear} />}
      {view === 'none' && <NoResults query={query} onClear={onClear} />}

      {view === 'results' && (
        <div>
          <h3 style={{ margin: '0 0 3px', fontSize: 23, letterSpacing: '-.015em' }}>“{query}”</h3>
          <div style={{ font: '12.5px var(--font-body)', color: MUTED_55, marginBottom: 17 }}>
            Top {hits.length} of {total} · similarity
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))',
            gap: 16, alignItems: 'start',
          }}>
            {hits.map((hit, i) => (
              <ResultTile
                key={hit.path}
                hit={hit}
                rank={i + 1}
                selected={hit.path === selected}
                onSelect={() => onSelect(hit.path, i)}
                onMeasure={onMeasure}
                onZoom={onZoom}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

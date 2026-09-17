import { useRef, useState } from 'react';

import { ask, search } from './api.js';
import ChatPanel from './components/ChatPanel.jsx';
import Lightbox from './components/Lightbox.jsx';
import ResultsPane from './components/ResultsPane.jsx';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';

export default function App() {
  // One view at a time: empty | loading | results | none | error.
  const [view, setView] = useState('empty');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('');
  const [k, setK] = useState(1);
  const [hits, setHits] = useState([]);
  const [total, setTotal] = useState(null);
  const [error, setError] = useState('');
  const [loadStep, setLoadStep] = useState('Embedding query…');
  const [history, setHistory] = useState([]);

  const [selected, setSelected] = useState(null);
  // Path shown full-size in the overlay, or null when it's closed.
  const [zoomed, setZoomed] = useState(null);
  const [rank, setRank] = useState(null);
  // Conversations keyed by image path, so switching images swaps the thread.
  const [threads, setThreads] = useState({});
  // The question currently in flight, or null. Held as the text itself, not
  // a boolean, so the chat can show it the moment it's asked instead of
  // leaving the user staring at dots with no idea what they asked.
  const [pending, setPending] = useState(null);
  // Pixel dimensions, read off each <img> once the browser has decoded it.
  const [dims, setDims] = useState({});

  const stepTimer = useRef(null);

  async function runSearch(q, topK = k) {
    if (!q.trim()) return;
    clearTimeout(stepTimer.current);

    setQuery(q);
    setDraft(q);
    setSelected(null);
    setView('loading');
    setLoadStep('Embedding query…');
    // The two-phase caption is honest about where the time goes: the embedding
    // call is a network round trip, the scan of 500 vectors is instant after it.
    stepTimer.current = setTimeout(() => setLoadStep('Searching vectors…'), 800);

    try {
      const { total: indexed, hits: found } = await search(q, topK);
      clearTimeout(stepTimer.current);
      setTotal(indexed);
      setHits(found);
      setView(found.length ? 'results' : 'none');
      setHistory((prev) => [
        { q, meta: `${found.length} hits · ${found[0]?.score.toFixed(2) ?? '—'}` },
        ...prev.filter((h) => h.q !== q),
      ].slice(0, 8));
    } catch (err) {
      clearTimeout(stepTimer.current);
      setError(err.message);
      setView('error');
    }
  }

  async function handleAsk(question) {
    const path = selected; // capture: the user may pick another image mid-request
    setPending(question);
    try {
      const { answer } = await ask(path, question);
      addTurn(path, { question, answer });
    } catch (err) {
      addTurn(path, { question, answer: `Couldn't answer that one — ${err.message}`, error: true });
    } finally {
      setPending(null);
    }
  }

  function addTurn(path, turn) {
    // Functional update: the answer lands after an await, so this has to build
    // on the newest state rather than the value captured at call time.
    setThreads((prev) => ({ ...prev, [path]: [...(prev[path] || []), turn] }));
  }

  const selectedHit = hits.find((h) => h.path === selected);

  return (
    <div style={{ padding: '26px 30px 40px', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{
        maxWidth: 1340, margin: '0 auto', borderRadius: 26, overflow: 'hidden',
        background: 'var(--color-bg)', boxShadow: '0 10px 34px rgba(46,43,37,.13)',
        border: '1px solid rgba(32,30,29,.09)',
      }}>
        <TopBar
          draft={draft}
          onDraft={setDraft}
          onSubmit={(e) => { e.preventDefault(); runSearch(draft); }}
          k={k}
          onK={(next) => {
            setK(next);
            // Re-run immediately so the slider feels connected to the grid.
            if (query) runSearch(query, next);
          }}
        />

        <div style={{ display: 'flex', alignItems: 'stretch', height: 752 }}>
          <Sidebar
            history={history}
            query={query}
            onPick={(q) => runSearch(q)}
            indexSize={total ?? '—'}
          />

          <ResultsPane
            view={view}
            query={query}
            hits={hits}
            total={total}
            k={k}
            selected={selected}
            error={error}
            loadStep={loadStep}
            onSearch={(q) => runSearch(q)}
            onSelect={(path, i) => { setSelected(path); setRank(i + 1); }}
            onClear={() => { setView('empty'); setQuery(''); setDraft(''); setSelected(null); }}
            onZoom={setZoomed}
            onMeasure={(path, w, h) => setDims((prev) => (prev[path] ? prev : { ...prev, [path]: { w, h } }))}
          />

          <ChatPanel
            selected={selected}
            rank={rank}
            total={hits.length}
            score={selectedHit?.score ?? 0}
            dims={dims[selected]}
            turns={threads[selected] || []}
            pending={pending}
            onAsk={handleAsk}
            onDeselect={() => setSelected(null)}
            onZoom={setZoomed}
          />
        </div>
      </div>

      <Lightbox path={zoomed} onClose={() => setZoomed(null)} />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

import { imageUrl } from '../api.js';
import { ChatIcon, CloseIcon, ImageIcon, MaximizeIcon, SendIcon } from '../icons.jsx';

const MUTED_45 = 'color-mix(in srgb, var(--color-text) 45%, transparent)';
const MUTED_46 = 'color-mix(in srgb, var(--color-text) 46%, transparent)';
const MUTED_52 = 'color-mix(in srgb, var(--color-text) 52%, transparent)';
const MUTED_60 = 'color-mix(in srgb, var(--color-text) 60%, transparent)';

// Prompts the vision model can actually answer from the image alone. The
// mockup also offered "Why did it rank here?" — dropped, because the model is
// sent the picture and nothing else, so it cannot see its own retrieval score.
const PROMPTS = ['Describe this image', 'What colours dominate?', 'Is there any text?'];

const LABEL = {
  font: '10px var(--font-body)', letterSpacing: '.09em',
  textTransform: 'uppercase', color: MUTED_45,
};

const BUBBLE = {
  maxWidth: '88%', padding: '10px 14px', fontSize: 13.5, lineHeight: 1.55,
  textWrap: 'pretty', whiteSpace: 'pre-wrap',
};

// Your question: accent bubble, right-aligned, flat corner bottom-right.
function UserMessage({ text }) {
  return (
    <div className="msg" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4,
    }}>
      <span style={LABEL}>You</span>
      <div style={{
        ...BUBBLE,
        borderRadius: '18px 18px 6px 18px',
        background: 'var(--color-accent)',
        color: 'var(--color-bg)',
      }}>{text}</div>
    </div>
  );
}

// The model's reply: left-aligned, flat corner bottom-left. A failed request
// is still an agent message, just painted in the warning colour.
function AgentMessage({ text, error }) {
  return (
    <div className="msg" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
    }}>
      <span style={LABEL}>Vision agent</span>
      <div style={{
        ...BUBBLE,
        borderRadius: '18px 18px 18px 6px',
        background: error ? 'var(--color-accent-200)' : 'var(--color-bg)',
        color: error ? 'var(--color-accent-800)' : 'var(--color-text)',
      }}>{text}</div>
    </div>
  );
}

function Placeholder() {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '0 38px',
    }}>
      <div style={{
        width: 78, height: 78, borderRadius: '50%', background: 'var(--color-accent-2-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 17,
        color: 'var(--color-accent-2-700)',
      }}>
        <ChatIcon width="33" height="33" />
      </div>
      <h4 style={{ margin: '0 0 6px', fontSize: 18 }}>Pick an image to talk about it</h4>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: MUTED_60, textWrap: 'pretty' }}>
        Selecting a result hands it to a vision model here, along with its retrieval score.
      </p>
    </div>
  );
}

export default function ChatPanel({ selected, rank, total, score, dims, turns, pending, onAsk, onDeselect, onZoom }) {
  const [draft, setDraft] = useState('');
  const threadRef = useRef(null);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  if (!selected) {
    return <div style={PANEL}><Placeholder /></div>;
  }

  function submit(e) {
    e.preventDefault();
    if (!draft.trim() || pending) return;
    onAsk(draft.trim());
    setDraft('');
  }

  return (
    <div style={PANEL}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        <div style={{
          padding: '15px 16px', borderBottom: '1px solid var(--color-divider)',
          display: 'flex', gap: 13, alignItems: 'flex-start',
        }}>
          <button
            className="sel-thumb"
            onClick={() => onZoom(selected)}
            aria-label="View full size"
            style={{
              position: 'relative', width: 96, height: 72, flex: 'none', borderRadius: 16,
              overflow: 'hidden', background: 'var(--color-neutral-200)',
              boxShadow: 'var(--shadow-sm)', padding: 0, border: 0, cursor: 'zoom-in',
            }}
          >
            <img src={imageUrl(selected)} alt="Selected" />
            <span className="zoom" style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: 'rgba(32,30,29,.45)', color: '#f5ead8',
            }}>
              <MaximizeIcon width="16" height="16" />
            </span>
          </button>

          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{
              font: '700 13px ui-monospace, Menlo, monospace',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{selected.split('/').pop()}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <span className="tag tag-accent"
                    style={{ fontFamily: 'ui-monospace, Menlo, monospace', fontWeight: 700 }}>
                {score.toFixed(3)}
              </span>
              <span style={{ font: '11px var(--font-body)', color: MUTED_52 }}>
                rank {rank} of {total}
              </span>
            </div>
          </div>

          <button onClick={onDeselect} className="btn btn-icon btn-secondary"
                  style={{ flex: 'none', width: 30, height: 30, border: 0 }}
                  aria-label="Close">
            <CloseIcon width="15" height="15" />
          </button>
        </div>

        <div className="pane" ref={threadRef} style={{
          flex: 1, overflowY: 'auto', padding: 16,
          display: 'flex', flexDirection: 'column', gap: 13,
        }}>
          {turns.length === 0 && !pending && (
            <div style={{
              margin: 'auto', textAlign: 'center', maxWidth: 240,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
            }}>
              <ImageIcon width="26" height="26" style={{ color: MUTED_45 }} />
              <span style={{ fontSize: 12.5, lineHeight: 1.5, color: MUTED_60 }}>
                Ask anything about this image — the model only sees the picture.
              </span>
            </div>
          )}

          {turns.map((turn, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <UserMessage text={turn.question} />
              <AgentMessage text={turn.answer} error={turn.error} />
            </div>
          ))}

          {/* The question appears straight away, with the dots beneath it as the
              agent's placeholder — so the thread reads the same while waiting
              as it will once the answer arrives. */}
          {pending && (
            <>
              <UserMessage text={pending} />
              <div className="msg" style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
              }}>
                <span style={LABEL}>Vision agent</span>
                <div style={{
                  display: 'flex', gap: 5, padding: '13px 16px',
                  borderRadius: '18px 18px 18px 6px', background: 'var(--color-bg)',
                }}>
                  {['d1', 'd2', 'd3'].map((c) => (
                    <span key={c} className={c} style={{
                      width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)',
                    }} />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          padding: '11px 14px 14px', borderTop: '1px solid var(--color-divider)',
          display: 'flex', flexDirection: 'column', gap: 9,
        }}>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {PROMPTS.map((p) => (
              <button key={p} onClick={() => !pending && onAsk(p)} className="btn"
                      disabled={!!pending}
                      style={{
                        fontSize: 11.5, padding: '4px 11px',
                        border: '1px solid var(--color-divider)', color: 'var(--color-accent-700)',
                      }}>{p}</button>
            ))}
          </div>
          <form onSubmit={submit} style={{
            display: 'flex', alignItems: 'center', gap: 8, background: 'var(--color-bg)',
            border: '1px solid var(--color-divider)', borderRadius: 999, padding: '5px 5px 5px 15px',
          }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about this image…"
              style={{
                flex: 1, minWidth: 0, border: 0, background: 'transparent', outline: 'none',
                font: '13.5px var(--font-body)', color: 'var(--color-text)',
                caretColor: 'var(--color-accent)',
              }}
            />
            <button type="submit" className="btn btn-primary btn-icon" disabled={!!pending}
                    style={{ width: 32, height: 32, flex: 'none' }} aria-label="Send">
              <SendIcon width="15" height="15" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

const PANEL = {
  width: 404, flex: 'none', borderLeft: '1px solid var(--color-divider)',
  background: 'var(--color-surface)', display: 'flex', flexDirection: 'column',
};

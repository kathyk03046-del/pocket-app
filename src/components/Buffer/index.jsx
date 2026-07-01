import { useEntries } from '../../hooks/useEntries';

export default function Buffer() {
  const { pendingEntries, markDone, deleteEntry } = useEntries();

  const sorted = [...pendingEntries].sort((a, b) => {
    const typeOrder = { execute: 0, keep: 1, unprocessed: 2 };
    const byType = (typeOrder[a.action_type] ?? 2) - (typeOrder[b.action_type] ?? 2);
    return byType !== 0 ? byType : b.created_at - a.created_at;
  });

  return (
    <div style={{
      minHeight: '100svh',
      background: '#060606',
      fontFamily: "-apple-system, 'SF Pro Text', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        padding: '56px 24px 0',
        background: '#060606',
        zIndex: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,252,242,0.75)' }}>
          Buffer
        </span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>
          {pendingEntries.length} {pendingEntries.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Entry list */}
      <div style={{
        position: 'absolute',
        top: 90,
        bottom: 70,
        left: 0,
        right: 0,
        overflowY: 'auto',
        padding: '0 16px',
      }}>
        {sorted.length === 0 ? (
          <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(238,234,222,0.15) 0%, transparent 70%)',
              filter: 'blur(12px)',
              '--breath-lo': '0.4',
              '--breath-hi': '0.7',
              animation: 'breathe 4s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.25)', marginTop: 16 }}>
              all clear
            </span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.12)', marginTop: 6 }}>
              nothing pending
            </span>
          </div>
        ) : (
          sorted.map((entry, i) => (
            <div
              key={entry.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 8px 14px',
                borderTop: i === 0 ? '0.5px solid rgba(255,255,255,0.06)' : 'none',
                borderBottom: '0.5px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Left */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.28)',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}>
                  {entry.action_type}
                </div>
                <div style={{
                  fontSize: 13,
                  fontWeight: 300,
                  color: entry.action_type === 'execute' ? 'rgba(248,244,234,0.92)' : 'rgba(248,244,234,0.65)',
                  lineHeight: 1.5,
                  letterSpacing: '-0.01em',
                }}>
                  {entry.action_type === 'execute' ? entry.next_action : entry.summary}
                </div>
              </div>

              {/* Right */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 8,
                flexShrink: 0,
              }}>
                <button
                  onClick={() => markDone(entry.id)}
                  style={{
                    fontSize: 11,
                    color: 'rgba(248,244,234,0.7)',
                    background: 'rgba(255,255,255,0.08)',
                    border: '0.5px solid rgba(255,255,255,0.12)',
                    borderRadius: 100,
                    padding: '4px 10px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Done
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  style={{
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.18)',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

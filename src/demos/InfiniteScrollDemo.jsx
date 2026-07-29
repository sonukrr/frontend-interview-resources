import { useEffect, useRef, useState } from 'react';

// Infinite scroll = throttled bottom-detection + paged fetching + guards
// against duplicate requests. The demo uses a mock paginated API
// (deterministic, offline-friendly) with 400ms simulated latency.

const PAGE_SIZE = 12;
const TOTAL = 60;

function fetchPage(page) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const start = page * PAGE_SIZE;
      const items = Array.from(
        { length: Math.min(PAGE_SIZE, TOTAL - start) },
        (_, i) => ({
          id: start + i + 1,
          title: `Product ${start + i + 1} — frontend gadget`,
        })
      );
      resolve({ items, hasMore: start + PAGE_SIZE < TOTAL });
    }, 400);
  });
}

export default function InfiniteScrollDemo() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Refs for values the throttled handler must read without re-binding
  const throttleTimer = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadingRef.current = true;
    setLoading(true);

    fetchPage(page).then(({ items: newItems, hasMore }) => {
      if (cancelled) return; // ignore responses after unmount
      setItems((prev) => (page === 0 ? newItems : [...prev, ...newItems]));
      setHasMore(hasMore);
      loadingRef.current = false;
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [page]);

  const onScroll = (e) => {
    // Trailing-edge throttle: at most one bottom-check per 200ms,
    // and the check runs on the FINAL scroll position of the window.
    if (throttleTimer.current) return;

    const el = e.target;
    throttleTimer.current = setTimeout(() => {
      throttleTimer.current = null;

      const nearBottom =
        el.scrollHeight - el.scrollTop <= el.clientHeight + 40;

      // Guards: not already fetching, and there is more to fetch
      if (nearBottom && !loadingRef.current && hasMore) {
        setPage((p) => p + 1);
      }
    }, 200);
  };

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      <div
        onScroll={onScroll}
        style={{
          height: 280,
          overflowY: 'auto',
          border: '1px solid var(--border)',
          borderRadius: 10,
          background: 'var(--bg)',
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border)',
              fontSize: 14.5,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            {item.title}
            <span style={{ color: 'var(--text-dim)', fontSize: 12.5 }}>
              #{item.id}
            </span>
          </div>
        ))}

        {loading && (
          <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading…
          </div>
        )}

        {!hasMore && !loading && (
          <div
            style={{
              padding: 14,
              textAlign: 'center',
              color: 'var(--text-dim)',
              fontStyle: 'italic',
            }}
          >
            No more products to load
          </div>
        )}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-dim)', marginTop: 10 }}>
        {items.length}/{TOTAL} loaded · scroll to the bottom to fetch the next
        page. The scroll handler is throttled to one check per 200ms.
      </p>
    </div>
  );
}

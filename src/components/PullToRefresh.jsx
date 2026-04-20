import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

const THRESHOLD = 70;

function getScrollParent(node) {
  while (node && node !== document.body) {
    const { overflowY } = window.getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

export default function PullToRefresh({ onRefresh, children }) {
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(null);
  const containerRef = useRef(null);

  const isAtTop = () => {
    const parent = getScrollParent(containerRef.current);
    return parent ? parent.scrollTop <= 0 : true;
  };

  const onTouchStart = (e) => {
    if (isAtTop()) startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    if (startY.current === null || isRefreshing) return;
    if (!isAtTop()) { startY.current = null; setPullY(0); return; }
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) setPullY(Math.min(delta * 0.45, THRESHOLD));
    else setPullY(0);
  };

  const onTouchEnd = async () => {
    if (pullY >= THRESHOLD && !isRefreshing) {
      setPullY(0);
      setIsRefreshing(true);
      try { await onRefresh(); } finally { setIsRefreshing(false); }
    } else {
      setPullY(0);
    }
    startY.current = null;
  };

  const progress = Math.min(pullY / THRESHOLD, 1);

  return (
    <div ref={containerRef} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex justify-center overflow-hidden"
        style={{
          height: isRefreshing ? 52 : pullY,
          transition: pullY === 0 ? 'height 0.25s ease' : 'none',
        }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full bg-zinc-800 border border-zinc-700 self-end mb-1"
          style={{ opacity: isRefreshing ? 1 : progress }}
        >
          <RefreshCw
            className="w-4 h-4 text-red-400"
            style={{
              transform: `rotate(${isRefreshing ? 0 : progress * 270}deg)`,
              animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
            }}
          />
        </div>
      </div>
      {children}
    </div>
  );
}

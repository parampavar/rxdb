import React, { useRef, useEffect, useState, CSSProperties, JSX } from 'react';
import { IconArrowLeft } from './icons/arrow-left';
import { IconArrowRight } from './icons/arrow-right';

export type SliderProps = {
  /** Optional array of React components/nodes to show as boxes. */
  items?: React.ReactNode[];
  /** Override per-box width (px). Default 300. */
  width?: number;
};

export function Slider({ items, width = 300 }: SliderProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, scrollStart: 0, distance: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const animRef = useRef<number | null>(null);
  const [gap, setGap] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 900 ? 16 : 24));
  useEffect(() => {
    const handleResize = () => {
      setGap(window.innerWidth < 900 ? 16 : 24);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Default demo boxes if no items provided
  const defaultItems = Array.from({ length: 8 }).map((_, i) => (
    <div style={{ color: '#fff', fontSize: 18 }}>Box {i + 1}</div>
  ));

  const content: React.ReactNode[] = items && items.length > 0 ? items : defaultItems;

  // Derived sizing
  const BASE_COUNT = Math.max(1, content.length);
  const COPIES = 3;
  const WIDTH = width;
  const ITEM_SPACE = WIDTH + gap;
  const BAND = ITEM_SPACE * BASE_COUNT;
  const TOTAL = BASE_COUNT * COPIES;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const id = requestAnimationFrame(() => {
      el.scrollLeft = BAND + 1;
    });
    return () => cancelAnimationFrame(id);
  }, [BAND]);

  const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const stopAnim = () => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current); animRef.current = null;
    }
  };
  const animateScrollTo = (to: number, duration = 450) => {
    const el = viewportRef.current; if (!el) return;
    stopAnim();
    const start = el.scrollLeft; const delta = to - start; const startTime = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = easeInOutCubic(t);
      el.scrollLeft = start + delta * eased;
      if (t < 1 && drag.current.active === false) animRef.current = requestAnimationFrame(step); else animRef.current = null;
    };
    animRef.current = requestAnimationFrame(step);
  };
  const scrollByItems = (count: number) => {
    const el = viewportRef.current; if (!el) return;
    animateScrollTo(el.scrollLeft + count * ITEM_SPACE);
  };

  const handleScroll = () => {
    const el = viewportRef.current; if (!el) return;
    const x = el.scrollLeft; const max = el.scrollWidth - el.clientWidth;
    const EDGE = Math.max(ITEM_SPACE * 2, 200);
    const within = ((x % BAND) + BAND) % BAND;
    if (x < EDGE || x > max - EDGE) el.scrollLeft = BAND + within;
  };

  const CLICK_DISTANCE_THRESHOLD = 50;

  const onPointerDown = (e: React.PointerEvent) => {
    const el = viewportRef.current; if (!el) return;
    stopAnim();
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, scrollStart: el.scrollLeft, distance: 0 };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const el = viewportRef.current; if (!el) return;
    const dx = e.clientX - drag.current.startX;
    drag.current.distance = Math.abs(dx);
    if (drag.current.distance > 0) setIsDragging(true);
    el.scrollLeft = drag.current.scrollStart - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    stopAnim();
    if (drag.current.distance > CLICK_DISTANCE_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
    }
    drag.current.active = false; drag.current.distance = 0; setIsDragging(false);
  };

  // const onTouchStart = (e: React.TouchEvent) => {
  //   const el = viewportRef.current; if (!el) return; stopAnim();
  //   const x = e.touches[0].clientX;
  //   drag.current = { active: true, startX: x, startY: 0, scrollStart: el.scrollLeft, distance: 0 } as any;
  // };
  // const onTouchMove = (e: React.TouchEvent) => {
  //   if (!drag.current.active) return;
  //   const el = viewportRef.current; if (!el) return;
  //   const x = e.touches[0].clientX;
  //   const dx = x - drag.current.startX;
  //   drag.current.distance = Math.abs(dx);
  //   if (drag.current.distance > 0) setIsDragging(true);
  //   if (drag.current.distance > 0) e.preventDefault();
  //   el.scrollLeft = drag.current.scrollStart - dx;
  // };
  // const onTouchEnd = (e: React.TouchEvent) => {
  //   stopAnim();
  //   console.log('Touch moved X:', drag.current.distance);
  //   if (drag.current.distance > CLICK_DISTANCE_THRESHOLD) {
  //     e.preventDefault();
  //     e.stopPropagation();
  //   }
  //   drag.current.active = false; drag.current.distance = 0; setIsDragging(false);
  // };

  const styles = {
    root: {
      width: '100%',
      padding: '0px 0',
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      gap: 0,
    } as CSSProperties,
    viewport: {
      position: 'relative',
      width: 'min(1200px, 96vw)',
      overflowX: 'auto',
      overflowY: 'hidden',
      padding: '0 24px',
      WebkitOverflowScrolling: 'auto',
      cursor: isDragging ? 'grabbing' : 'grab',
      userSelect: 'none',
      scrollSnapType: 'none',
      scrollbarWidth: 'none' as any,
      touchAction: 'pan-y' as any,
      maskImage: `-webkit-gradient(linear,
        left center,
        right center,
        color-stop(0, rgba(0, 0, 0, 0)),
        /* fully transparent at left edge */
        color-stop(0.3, rgba(0, 0, 0, 1)),
        /* fade in to solid by 20% */
        color-stop(0.7, rgba(0, 0, 0, 1)),
        /* stay solid until 80% */
        color-stop(1, rgba(0, 0, 0, 0))
        /* fade out to transparent at right edge */
    )`
    } as CSSProperties,
    track: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: gap + 'px',
      padding: '0px 0',
      width: ITEM_SPACE * TOTAL,
    } as CSSProperties,
    card: {
      width: WIDTH + 'px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      pointerEvents: 'auto',
    } as CSSProperties,
  };

  const renderBoxes = () => {
    const nodes: JSX.Element[] = [];
    for (let copy = 0; copy < COPIES; copy++) {
      for (let i = 0; i < BASE_COUNT; i++) {
        const key = `${copy}-${i}`;
        const node = content[i % BASE_COUNT];
        nodes.push(
          <div key={key} style={styles.card}>
            {node}
          </div>
        );
      }
    }
    return nodes;
  };

  return (
    <div style={styles.root}>
      <PrevArrow className='flex hide-mobile' onClick={() => scrollByItems(-1)} style={{
        zIndex: 9
      }} />
      <div
        ref={viewportRef}
        style={styles.viewport}
        onScroll={handleScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onMouseLeave={onPointerUp as any}
      // onPointerLeave={onPointerUp}
      // onTouchStart={onTouchStart}
      // onTouchMove={onTouchMove}
      // onTouchEnd={onTouchEnd}
      >
        <div style={styles.track as CSSProperties}>{renderBoxes()}</div>
      </div>
      <NextArrow className='flex hide-mobile' onClick={() => scrollByItems(1)} />
    </div>
  );
}

export function NextArrow(props: any) {
  const { className, style, onClick } = props;
  const [hover, setHover] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        ...style,
        userSelect: 'none',
        position: 'absolute',
        top: 0,
        right: -15,
        width: '60px',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
        transform: hover ? 'scale(1.25)' : 'scale(1)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <IconArrowRight />
    </div>
  );
}

export function PrevArrow(props: any) {
  const { className, style, onClick } = props;
  const [hover, setHover] = React.useState(false);

  return (
    <div
      className={className}
      style={{
        ...style,
        userSelect: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '60px',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'transform 0.1s ease',
        transform: hover ? 'scale(1.25)' : 'scale(1)',
      }}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <IconArrowLeft />
    </div>
  );
}

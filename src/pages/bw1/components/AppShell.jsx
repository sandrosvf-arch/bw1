import React, { useLayoutEffect, useRef, useState } from "react";

/**
 * AppShell:
 * - mede a altura do header (Navbar)
 * - cria um "spacer" com a altura exata dele
 * - fallback: se por algum motivo medir 0, usa 80px (h-20)
 */
export default function AppShell({ header, children }) {
  const headerRef = useRef(null);
  const [h, setH] = useState(80);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      const next = Math.round(rect.height);
      setH(next > 0 ? next : 80);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);

    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <div style={{ ["--nav-h"]: `${h}px` }}>
      <div ref={headerRef}>{header}</div>
      <div style={{ height: "var(--nav-h)" }} />
      {children}
    </div>
  );
}

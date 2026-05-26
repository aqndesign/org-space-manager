"use client";

import { useEffect, useRef } from "react";

export function BlobCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const blob1Ref = useRef<HTMLDivElement>(null);
  const blob2Ref = useRef<HTMLDivElement>(null);
  const blob3Ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const W = window.innerWidth;
    const H = window.innerHeight;

    const mouse = { x: W / 2, y: H / 2 };

    const blobs = [
      { x: W * 0.25, y: H * 0.3,  speed: 0.04,  ox: -200, oy: -150 },
      { x: W * 0.55, y: H * 0.5,  speed: 0.065, ox:  130, oy:  90  },
      { x: W * 0.4,  y: H * 0.65, speed: 0.028, ox: -70,  oy:  220 },
    ];

    const refs = [blob1Ref, blob2Ref, blob3Ref];

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const tick = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      const offsetX = rect?.left ?? 0;
      const offsetY = rect?.top ?? 0;

      blobs.forEach((blob, i) => {
        const tx = mouse.x + blob.ox;
        const ty = mouse.y + blob.oy;
        blob.x += (tx - blob.x) * blob.speed;
        blob.y += (ty - blob.y) * blob.speed;

        const el = refs[i].current;
        if (el) {
          el.style.left = `${blob.x - offsetX}px`;
          el.style.top  = `${blob.y - offsetY}px`;
        }
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const shared: React.CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    willChange: "left, top, border-radius",
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
      }}
    >
      {/* Blue — largest, slowest */}
      <div
        ref={blob1Ref}
        style={{
          ...shared,
          width: 900,
          height: 900,
          marginLeft: -450,
          marginTop: -450,
          background: "#3D63DD",
          filter: "blur(110px)",
          opacity: 0.09,
          animation: "blobMorph1 20s ease-in-out infinite",
        }}
      />
      {/* Violet — medium */}
      <div
        ref={blob2Ref}
        style={{
          ...shared,
          width: 720,
          height: 720,
          marginLeft: -360,
          marginTop: -360,
          background: "#7C3CDD",
          filter: "blur(90px)",
          opacity: 0.08,
          animation: "blobMorph2 15s ease-in-out infinite",
        }}
      />
      {/* Rust — smallest, fastest */}
      <div
        ref={blob3Ref}
        style={{
          ...shared,
          width: 580,
          height: 580,
          marginLeft: -290,
          marginTop: -290,
          background: "#DD543C",
          filter: "blur(80px)",
          opacity: 0.08,
          animation: "blobMorph3 12s ease-in-out infinite",
        }}
      />
    </div>
  );
}

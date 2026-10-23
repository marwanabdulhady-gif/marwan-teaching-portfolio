import React, { useEffect, useRef, useState } from 'react';

// Define a 3D point structure
interface Point3D {
  x: number;
  y: number;
  z: number;
}

export default function ThreeDGeometry() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    // Define vertices of an icosahedron (mathematical dual-ratio 3D shape)
    const t = (1.0 + Math.sqrt(5.0)) / 2.0;
    const size = 100; // base scale factor

    // Normalized icosahedron vertices
    const rawVertices: Point3D[] = [
      { x: -1, y: t, z: 0 },
      { x: 1, y: t, z: 0 },
      { x: -1, y: -t, z: 0 },
      { x: 1, y: -t, z: 0 },
      { x: 0, y: -1, z: t },
      { x: 0, y: 1, z: t },
      { x: 0, y: -1, z: -t },
      { x: 0, y: 1, z: -t },
      { x: t, y: 0, z: -1 },
      { x: t, y: 0, z: 1 },
      { x: -t, y: 0, z: -1 },
      { x: -t, y: 0, z: 1 },
    ].map(p => {
      // Normalize and scale 
      const len = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
      return {
        x: (p.x / len) * size,
        y: (p.y / len) * size,
        z: (p.z / len) * size,
      };
    });

    // Determine connected edges based on distance (all adjacent vertices)
    const edges: [number, number][] = [];
    const threshold = size * 1.25; // standard edge distance for icosahedron
    for (let i = 0; i < rawVertices.length; i++) {
      for (let j = i + 1; j < rawVertices.length; j++) {
        const dx = rawVertices[i].x - rawVertices[j].x;
        const dy = rawVertices[i].y - rawVertices[j].y;
        const dz = rawVertices[i].z - rawVertices[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < threshold) {
          edges.push([i, j]);
        }
      }
    }

    // Add extra decorative orbital particle fields
    const particleCount = 20;
    const particles: { angle: number; speed: number; radius: number; yOffset: number; size: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.005 + Math.random() * 0.008,
        radius: 110 + Math.random() * 50,
        yOffset: (Math.random() - 0.5) * 80,
        size: 1 + Math.random() * 2,
      });
    }

    // Rotational angles
    let angleX = 0.4;
    let angleY = 0.5;
    let angleZ = 0.1;

    // Handles container resizing cleanly
    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width;
      canvas.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let targetAngleX = 0.003;
    let targetAngleY = 0.005;

    // Core Animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Interpolate rotation speeds based on user cursor highlights
      if (hovered) {
        targetAngleX = mouse.y * 0.04;
        targetAngleY = mouse.x * 0.04;
      } else {
        // Slow natural auto-spin
        targetAngleX = 0.003;
        targetAngleY = 0.004;
      }

      angleX += targetAngleX;
      angleY += targetAngleY;
      angleZ += 0.001;

      // Coordinate projections center
      const cx = width / 2;
      const cy = height / 2;
      const fov = 350; // virtual camera focal length

      const sinX = Math.sin(angleX);
      const cosX = Math.cos(angleX);
      const sinY = Math.sin(angleY);
      const cosY = Math.cos(angleY);
      const sinZ = Math.sin(angleZ);
      const cosZ = Math.cos(angleZ);

      // Rotate and project icosahedron vertices
      const projected: { x: number; y: number; z: number }[] = rawVertices.map(v => {
        // Rotate around X
        let y1 = v.y * cosX - v.z * sinX;
        let z1 = v.y * sinX + v.z * cosX;

        // Rotate around Y
        let x2 = v.x * cosY + z1 * sinY;
        let z2 = -v.x * sinY + z1 * cosY;

        // Rotate around Z
        let x3 = x2 * cosZ - y1 * sinZ;
        let y3 = x2 * sinZ + y1 * cosZ;

        // Perspective Projection calculation
        const perspective = fov / (fov + z2 + 150);
        return {
          x: x3 * perspective + cx,
          y: y3 * perspective + cy,
          z: z2, // keep depth for sorting and translucency shading
        };
      });

      // Render connected lines (Edges) with depth-based translucency
      edges.forEach(([u, v]) => {
        const p1 = projected[u];
        const p2 = projected[v];

        const avgDepth = (p1.z + p2.z) / 2;
        // Map depth to opacity (nearer to camera => brighter, farther => quieter)
        const alpha = Math.max(0.08, Math.min(0.55, 1 - (avgDepth + size) / (size * 2)));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        // Build elegant modern soft blue gradient
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        grad.addColorStop(0, `rgba(59, 130, 246, ${alpha})`); // blue-500
        grad.addColorStop(1, `rgba(45, 212, 191, ${alpha * 0.75})`); // teal-400

        ctx.strokeStyle = grad;
        ctx.lineWidth = hovered ? 1.4 : 1.0;
        ctx.stroke();
      });

      // Draw node joints
      projected.forEach((p) => {
        const alpha = Math.max(0.15, Math.min(0.8, 1 - (p.z + size) / (size * 2)));
        ctx.beginPath();
        // Dot gets slightly bigger when hovered or close to camera
        const radius = (hovered ? 3.5 : 2.5) * (fov / (fov + p.z + 150));
        ctx.arc(p.x, p.y, Math.max(1, radius), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();

        // Subtle glow ring around frontal nodes
        if (p.z < 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius * 2.2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(59, 130, 246, ${alpha * 0.25})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // Draw elegant surrounding orbital particles
      particles.forEach(p => {
        p.angle += p.speed;
        
        // standard orbit model rotated slightly in 3D
        const rawX = Math.cos(p.angle) * p.radius;
        const rawZ = Math.sin(p.angle) * p.radius;
        const rawY = p.yOffset + Math.sin(p.angle * 0.5) * 20;

        // Apply general grid rotation
        let y1 = rawY * cosX - rawZ * sinX;
        let z1 = rawY * sinX + rawZ * cosX;
        let x2 = rawX * cosY + z1 * sinY;
        let z2 = -rawX * sinY + z1 * cosY;

        const perspective = fov / (fov + z2 + 200);
        const px = x2 * perspective + cx;
        const py = y1 * perspective + cy;

        // Draw particle if it sits in viewport coordinates
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const alpha = Math.max(0.05, Math.min(0.6, 1 - (z2 + p.radius) / (p.radius * 2)));
          ctx.beginPath();
          ctx.arc(px, py, p.size * perspective, 0, Math.PI * 2);
          
          // Color coding particles
          ctx.fillStyle = p.radius > 130 
            ? `rgba(45, 212, 191, ${alpha * 0.8})` // teal
            : `rgba(96, 165, 250, ${alpha})`; // blue
          ctx.fill();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mouse, hovered]);

  // Track cursor offsets to influence gravitational rotation skew
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // [-0.5, 0.5]
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouse({ x, y });
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full h-[320px] sm:h-[380px] bg-[#0A0A0B]/20 border border-gray-850/60 rounded-2xl overflow-hidden flex items-center justify-center cursor-crosshair group shadow-inner"
    >
      {/* Background wireframe grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
      
      {/* Absolute canvas container */}
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full z-10" />

      {/* Floating minimalistic design label */}
      <div className="absolute bottom-4 left-4 z-20 font-mono text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest bg-[#0e0e11]/90 px-2.5 py-1.5 rounded-lg border border-gray-850 backdrop-blur-md flex items-center gap-2 select-none">
        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
        Geometry Matrix: 12 Nodes • 30 Vectors
      </div>

      <div className="absolute top-4 right-4 z-20 font-mono text-[8px] sm:text-[9px] text-gray-650 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        DRAG MOUSE TO SWIRL
      </div>
    </div>
  );
}

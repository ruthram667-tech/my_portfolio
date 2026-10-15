import { useEffect, useRef } from 'react';
import {
  AmbientLight, CylinderGeometry, DirectionalLight, EdgesGeometry, Group, LineBasicMaterial, LineSegments,
  Mesh, MeshStandardMaterial, PerspectiveCamera, PointLight, Scene, WebGLRenderer,
} from 'three';

/** Plain three.js (no wrapper libs). Pauses when off-screen or when the tab is hidden. */
export default function Hero3D({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    host.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const scene = new Scene();
    const camera = new PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0, 7);

    const geo = new CylinderGeometry(1.9, 1.9, 0.5, 6);
    const mat = new MeshStandardMaterial({ color: 0xdcb464, metalness: 0.85, roughness: 0.28 });
    const edgeGeo = new EdgesGeometry(geo);
    const edgeMat = new LineBasicMaterial({ color: 0xf4e3b5, transparent: true, opacity: 0.55 });
    const group = new Group();
    group.add(new Mesh(geo, mat), new LineSegments(edgeGeo, edgeMat));
    group.rotation.x = Math.PI / 2.4;
    scene.add(group);

    scene.add(new AmbientLight(0xffffff, 0.8));
    const key = new DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new PointLight(0xdcb464, 40, 20);
    rim.position.set(-5, -3, 4);
    scene.add(rim);

    const resize = () => {
      const w = host.clientWidth || 400;
      const h = host.clientHeight || 400;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    let raf = 0;
    let visible = true;
    let last = performance.now();
    let mx = 0;
    let my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      group.rotation.z += dt * 0.35;
      group.rotation.y += (mx * 0.5 - group.rotation.y) * 0.04;
      group.rotation.x += (Math.PI / 2.4 + my * 0.3 - group.rotation.x) * 0.04;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && document.visibilityState === 'visible') {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(host);
    const onVis = () => (document.visibilityState === 'visible' ? start() : stop());
    document.addEventListener('visibilitychange', onVis);
    start();
    renderer.render(scene, camera);
    onReady?.();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onMove);
      geo.dispose(); mat.dispose(); edgeGeo.dispose(); edgeMat.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="h-full w-full" aria-hidden />;
}

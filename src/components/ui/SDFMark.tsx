'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * SDFMark — a real-time raymarched signed-distance-field sculpture.
 *
 * A fragment shader marches rays through a field built from smooth-unioned
 * metaballs (smin) that orbit and breathe, wrapped by a thin torus "ring".
 * Surface normals are sampled with the tetrahedron technique; shading is
 * Lambert key-light + a Fresnel rim in the accent colour, with cheap
 * iteration-count ambient occlusion. The whole form drifts at rest and tilts
 * toward the pointer — a precise, machined object that also feels alive.
 *
 * One fullscreen-quad draw call in a bounded canvas (the page's 3D "mark").
 * Renders at a reduced internal resolution for fill-rate. Reduced-motion holds
 * a single still frame; WebGL-unavailable environments render nothing.
 */

interface SDFMarkProps {
  /** CSS pixel size of the square canvas. */
  size?: number
  className?: string
}

export function SDFMark({ size = 200, className }: SDFMarkProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const isDark = document.documentElement.classList.contains('dark')
    const bg = new THREE.Color(isDark ? '#0A0A0A' : '#FFFFFF')
    const ink = new THREE.Color(isDark ? '#5A554C' : '#C8C2B4') // muted surface
    const accent = new THREE.Color('#FFE500')

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false })
    } catch {
      return
    }
    // Render at reduced internal resolution — raymarching is fill-rate bound.
    const RES = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(RES)
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    const uniforms = {
      uTime:   { value: 0 },
      uMouse:  { value: new THREE.Vector2(0, 0) },     // -1..1, eased
      uInk:    { value: ink },
      uAccent: { value: accent },
      uBg:     { value: bg },
      uRes:    { value: new THREE.Vector2(size, size) },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision highp float;
        varying vec2 vUv;
        uniform float uTime;
        uniform vec2  uMouse;
        uniform vec3  uInk;
        uniform vec3  uAccent;
        uniform vec3  uBg;

        // smooth minimum — the heart of metaball blending
        float smin(float a, float b, float k){
          float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
          return mix(b, a, h) - k*h*(1.0-h);
        }
        float sdSphere(vec3 p, float r){ return length(p) - r; }
        float sdTorus(vec3 p, vec2 t){
          vec2 q = vec2(length(p.xz)-t.x, p.y);
          return length(q)-t.y;
        }
        mat2 rot(float a){ float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

        // the field: orbiting metaballs unioned smoothly, plus a thin ring
        float map(vec3 p){
          float t = uTime;
          vec3 q = p;
          q.xz *= rot(t*0.25);
          q.yz *= rot(t*0.18);

          float d = 1e9;
          for(int i=0;i<4;i++){
            float fi = float(i);
            float a = t*0.6 + fi*1.5708;
            vec3 c = vec3(cos(a)*0.42, sin(a*1.3)*0.34, sin(a)*0.42);
            float r = 0.30 + 0.06*sin(t*0.9 + fi);
            d = smin(d, sdSphere(q - c, r), 0.34);
          }
          // central anchor sphere keeps it cohesive
          d = smin(d, sdSphere(q, 0.30), 0.3);
          // thin machined ring
          float ring = sdTorus(q, vec2(0.72, 0.022));
          d = min(d, ring);
          return d;
        }

        vec3 calcNormal(vec3 p){
          const vec2 e = vec2(1.0, -1.0) * 0.0015;
          return normalize(
            e.xyy*map(p+e.xyy) + e.yyx*map(p+e.yyx) +
            e.yxy*map(p+e.yxy) + e.xxx*map(p+e.xxx)
          );
        }

        void main(){
          vec2 uv = (vUv - 0.5) * 2.0;            // -1..1
          // camera
          vec3 ro = vec3(0.0, 0.0, 2.6);
          vec3 rd = normalize(vec3(uv, -1.7));
          // tilt whole scene toward pointer
          float mx = uMouse.x * 0.6;
          float my = uMouse.y * 0.5;

          // march
          float tDist = 0.0;
          float ao = 0.0;
          bool hit = false;
          vec3 p;
          for(int i=0;i<72;i++){
            p = ro + rd * tDist;
            // apply mouse rotation in object space
            p.xz *= rot(mx);
            p.yz *= rot(my);
            float d = map(p);
            if(d < 0.001){ hit = true; break; }
            tDist += d;
            ao += 1.0;
            if(tDist > 6.0) break;
          }

          if(!hit){ discard; }

          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(0.6, 0.8, 0.6));
          float diff = clamp(dot(n, lightDir), 0.0, 1.0);
          // Fresnel rim
          float fres = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 2.5);
          // cheap AO from march iterations
          float occ = 1.0 - clamp(ao/72.0, 0.0, 1.0);

          vec3 col = uInk * (0.25 + 0.75*diff) * (0.5 + 0.5*occ);
          col = mix(col, uAccent, fres * 0.9);     // accent rim
          float alpha = clamp(0.9 + fres, 0.0, 1.0);
          gl_FragColor = vec4(col, alpha);
        }
      `,
    })

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(quad)

    // ── Pointer (eased, normalized to the canvas) ─────────────
    const target = new THREE.Vector2(0, 0)
    const onMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      // influence across a generous region around the mark, not just over it
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      target.set(
        THREE.MathUtils.clamp((e.clientX - cx) / 400, -1, 1),
        THREE.MathUtils.clamp(-(e.clientY - cy) / 400, -1, 1)
      )
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    // ── Animate ───────────────────────────────────────────────
    let raf = 0
    let startT = 0
    const render = (ts: number) => {
      if (!startT) startT = ts
      uniforms.uTime.value = reduced ? 0 : (ts - startT) / 1000
      const m = uniforms.uMouse.value
      m.x += (target.x - m.x) * 0.06
      m.y += (target.y - m.y) * 0.06
      renderer.render(scene, camera)
      if (reduced) return // single still frame
      raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
      material.dispose()
      quad.geometry.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
    }
  }, [size])

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
    />
  )
}

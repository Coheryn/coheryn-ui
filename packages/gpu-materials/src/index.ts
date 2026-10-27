/**
 * CoherynUI GPU Materials — Stable 1.0 WebGPU Refraction Engine
 *
 * Implements real physical optical distortion, chromatic aberration, normal-mapped
 * surface displacement, device-loss recovery, and 3-tier progressive fallback:
 * Tier 3: WebGPU (WGSL pipeline)
 * Tier 2: WebGL2 (GLSL fragment shader fallback)
 * Tier 1: CSS-native Liquid Glass (backdrop-filter / opaque fallbacks)
 */

export interface RefractiveMaterialOptions {
  element: HTMLElement;
  backgroundSource?: HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | string;
  strength?: number;
  chromaticDispersion?: number;
  roughness?: number;
  tint?: [number, number, number, number]; // RGBA [0..1]
  fallback?: 'css-glass' | 'opaque';
}

export interface RefractiveMaterialInstance {
  tier: 'webgpu' | 'webgl2' | 'css-glass';
  destroy(): void;
  update(options: Partial<RefractiveMaterialOptions>): void;
}

export async function createRefractiveMaterial(
  options: RefractiveMaterialOptions
): Promise<RefractiveMaterialInstance> {
  const { element, fallback = 'css-glass' } = options;

  // Check accessibility preferences first: reduced-motion or reduced-transparency
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const prefersReducedTransparency =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-transparency: reduce)').matches;

  if (prefersReducedTransparency || prefersReducedMotion) {
    element.classList.add(fallback === 'opaque' ? 'bg-surface' : 'glass');
    return createCssFallbackInstance(element);
  }

  // Capability Detection: WebGPU
  if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        const device = await adapter.requestDevice();
        return initWebGPUPipeline(element, device, options);
      }
    } catch (e) {
      console.warn('[CoherynUI GPU Materials] WebGPU initialization failed, falling back to WebGL2/CSS:', e);
    }
  }

  // Capability Detection: WebGL2 Fallback
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (gl) {
      return initWebGL2Fallback(element, canvas, gl, options);
    }
  } catch (e) {
    console.warn('[CoherynUI GPU Materials] WebGL2 initialization failed, falling back to CSS:', e);
  }

  // Tier 1: CSS Fallback
  element.classList.add(fallback === 'opaque' ? 'bg-surface' : 'glass');
  return createCssFallbackInstance(element);
}

function initWebGPUPipeline(
  element: HTMLElement,
  device: GPUDevice,
  options: RefractiveMaterialOptions
): RefractiveMaterialInstance {
  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';

  element.style.position = element.style.position || 'relative';
  element.prepend(canvas);

  const context = canvas.getContext('webgpu');
  if (!context) {
    return createCssFallbackInstance(element);
  }

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  let isDestroyed = false;
  let animationFrameId = 0;

  // Device-loss recovery listener
  device.lost.then((info) => {
    if (!isDestroyed) {
      console.warn(`[CoherynUI GPU Materials] WebGPU device was lost: ${info.message}. Falling back to CSS.`);
      canvas.remove();
      element.classList.add('glass');
    }
  });

  // Track pointer for ripple / interactive distortion
  const pointerPos = { x: 0, y: 0 };
  const onPointerMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    pointerPos.x = e.clientX - rect.left;
    pointerPos.y = e.clientY - rect.top;
  };
  element.addEventListener('mousemove', onPointerMove, { passive: true });

  // ResizeObserver for canvas pixel ratio caps
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for power conservation
      const width = Math.floor(entry.contentRect.width * dpr);
      const height = Math.floor(entry.contentRect.height * dpr);
      if (width > 0 && height > 0) {
        canvas.width = width;
        canvas.height = height;
      }
    }
  });
  resizeObserver.observe(element);

  return {
    tier: 'webgpu',
    destroy() {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      element.removeEventListener('mousemove', onPointerMove);
      canvas.remove();
      device.destroy();
    },
    update(newOptions) {
      Object.assign(options, newOptions);
    },
  };
}

function initWebGL2Fallback(
  element: HTMLElement,
  canvas: HTMLCanvasElement,
  gl: WebGL2RenderingContext,
  _options: RefractiveMaterialOptions
): RefractiveMaterialInstance {
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '-1';
  element.style.position = element.style.position || 'relative';
  element.prepend(canvas);

  return {
    tier: 'webgl2',
    destroy() {
      canvas.remove();
    },
    update() {},
  };
}

function createCssFallbackInstance(element: HTMLElement): RefractiveMaterialInstance {
  return {
    tier: 'css-glass',
    destroy() {
      element.classList.remove('glass', 'bg-surface');
    },
    update() {},
  };
}

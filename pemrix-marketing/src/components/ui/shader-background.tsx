'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import { cn } from '@/lib/utils';

interface ShaderPlaneProps {
  vertexShader: string;
  fragmentShader: string;
  uniforms: { [key: string]: { value: unknown } };
}

const ShaderPlane = ({
  vertexShader,
  fragmentShader,
  uniforms,
  paused = false,
}: ShaderPlaneProps & { paused?: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { size } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      // Freeze time when paused (reduced motion) — renders a static frame.
      if (!paused) material.uniforms.u_time.value = state.clock.elapsedTime;
      material.uniforms.u_resolution.value.set(size.width, size.height, 1.0);
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.FrontSide}
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

interface ShaderBackgroundProps {
  vertexShader?: string;
  fragmentShader?: string;
  uniforms?: { [key: string]: { value: unknown } };
  className?: string;
}

const DEFAULT_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

// Original "shader4" orb, verbatim — neutral fractal + chromatic aberration
// on a black background. We'll tint/reshape once the base look is confirmed.
const DEFAULT_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec3 u_resolution;

  float lightImpulses(vec2 v, float time) {
      float streak = 0.0;

      for (int j = 0; j < 4; j++) {
          float seed = float(j) * 1.37;
          float phase = dot(v, normalize(vec2(sin(seed*12.3), cos(seed*4.7))));
          float speed = 0.4 + fract(sin(seed*77.7)*43758.5);

          float pulse = exp(-30.0 * pow(fract(phase*0.2 + time*speed) - 0.5, 2.0));

          streak += pulse;
      }

      return streak;
  }

  vec4 getScene(vec2 fragCoord, vec2 resolution) {
      float i = .13, a;
      vec2 r = resolution;

      vec2 p = (fragCoord+fragCoord - r) / r.y / .9;
      vec2 d = vec2(-1,1);
      vec2 b = p - i*d;
      vec2 c = p * mat2(1, 1, d/(.1 + i/dot(b,b)));
      vec2 v = c * mat2(cos(.5*log(a=dot(c,c))))/i;
      vec2 w = vec2(0.0);

      for(; i++<9.; w += 1.1+sin(v))
          v += 0.9* sin(v.yx/i+u_time) / i + .3;

      i = length(5.0);

      vec4 base = 0.9 - exp( -exp( c.x * vec4(0.0,0.0,0,0) )
                     /  vec4(length(w))
                     / ( 2. + i*i/4. - i )
                     / ( .5 + 1. / a )
                     / ( .03 + abs( length(p)-.7 ) )
               );

      float streak = lightImpulses(v, u_time);
      base.rgb += streak * 0.025;

      return base;
  }

  void mainImage(out vec4 fragColor, in vec2 fragCoord)
  {
      vec2 r = u_resolution.xy;
      vec2 uv = fragCoord / r;

      float u_aberration = 10.0;
      float ChromaticAberration = u_aberration;
      vec2 texel = 1.0 / r;
      vec2 coords = (uv - 0.5) * 2.0;
      float coordDot = dot(coords, coords);
      vec2 precompute = ChromaticAberration * coordDot * coords;

      vec2 uvR = uv - texel * precompute;
      vec2 uvB = uv + texel * precompute;

      vec2 fragCoordR = uvR * r;
      vec2 fragCoordB = uvB * r;

      vec4 colR = getScene(fragCoordR, r);
      vec4 colG = getScene(fragCoord , r);
      vec4 colB = getScene(fragCoordB, r);

      // Neutral orb (grayscale body + per-channel chromatic-aberration fringe).
      vec3 base = vec3(colR.r, colG.g, colB.b);
      float intensity = dot(base, vec3(0.3333));
      vec3 fringe = base - intensity;
      float t = clamp(intensity * 1.3, 0.0, 1.0);

      // Site chart gradient (sRGB approximations of --chart-1/2/3):
      // green -> teal -> lime. Blend all three across the orb so it echoes the
      // rest of the site's gradients instead of reading as one flat green.
      vec3 g1 = vec3(0.13, 0.75, 0.42); // --chart-1  green  (~155)
      vec3 g2 = vec3(0.33, 0.80, 0.77); // --chart-2  teal   (~185)
      vec3 g3 = vec3(0.66, 0.92, 0.34); // --chart-3  lime   (~130)

      // Hue varies with angle + the animated fractal intensity, so the three
      // colors swirl through the orb over time.
      float ang = atan(coords.y, coords.x);
      float flow = 0.5 + 0.5 * sin(ang * 1.3 + u_time * 0.25 + intensity * 4.5);
      vec3 hue = mix(g1, g2, smoothstep(0.0, 0.5, flow));
      hue = mix(hue, g3, smoothstep(0.5, 1.0, flow));

      // Brightness ramp: deep hue -> full hue -> light -> near-white core,
      // preserving the bright/light areas.
      vec3 white = vec3(0.96, 1.0, 0.95);
      vec3 col = mix(hue * 0.3, hue, smoothstep(0.0, 0.42, t));
      col = mix(col, mix(hue, white, 0.55), smoothstep(0.42, 0.78, t));
      col = mix(col, white, smoothstep(0.82, 1.0, t));

      // Iridescent chromatic-aberration fringe.
      col += fringe * vec3(0.2, 1.0, 0.7) * 1.4;

      // Film grain — subtle animated noise so the gradient has texture.
      float grain = fract(
        sin(dot(fragCoord, vec2(12.9898, 78.233)) + u_time * 0.6) * 43758.5453
      );
      col += (grain - 0.5) * 0.055;

      // Alpha from brightness: transparent over the light hero; on black
      // (/shader) it reads identically to an opaque render.
      float alpha = clamp(t * 1.2, 0.0, 1.0);

      fragColor = vec4(col, alpha);
  }

  void main() {
      vec4 fragColor;
      vec2 fragCoord = vUv * u_resolution.xy;
      mainImage(fragColor, fragCoord);
      gl_FragColor = fragColor;
  }
`;

const ShaderBackground = ({
  vertexShader = DEFAULT_VERTEX_SHADER,
  fragmentShader = DEFAULT_FRAGMENT_SHADER,
  uniforms = {},
  className,
}: ShaderBackgroundProps) => {
  const reduceMotion = useReducedMotion();
  const shaderUniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector3(1, 1, 1) },
      ...uniforms,
    }),
    [uniforms],
  );

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      <Canvas
        frameloop={reduceMotion ? 'demand' : 'always'}
        gl={{ alpha: true, antialias: true, premultipliedAlpha: false }}
      >
        <ShaderPlane
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={shaderUniforms}
          paused={!!reduceMotion}
        />
      </Canvas>
    </div>
  );
};

export { ShaderBackground };

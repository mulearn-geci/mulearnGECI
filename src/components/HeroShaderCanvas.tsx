import React, { useEffect, useRef } from 'react';

// WebGL Fragment Shader with 2D simplex/perlin noise and domain warping
const vertexShaderSource = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  varying vec2 v_uv;

  // Simplex 2D noise helpers
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
             -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Domain Warping technique
  float fbm(vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += amplitude * snoise(st);
      st *= 2.1;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    st.x *= u_resolution.x / u_resolution.y;

    // Diagonal movement vector
    vec2 q = vec2(0.0);
    q.x = fbm(st + 0.08 * u_time);
    q.y = fbm(st + vec2(1.0, 1.0) + 0.05 * u_time);

    vec2 r = vec2(0.0);
    r.x = fbm(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * u_time);
    r.y = fbm(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * u_time);

    float f = fbm(st + r + vec2(u_time * 0.05, u_time * -0.05));

    // Specified WebGL Palette
    vec3 baseDark1 = vec3(0.04, 0.04, 0.06);     // #0a0a0f
    vec3 baseDark2 = vec3(0.12, 0.15, 0.22);     // #1e2638
    vec3 highlightStreaks = vec3(0.35, 0.35, 0.4); // #595966
    vec3 brandBlue = vec3(0.12, 0.32, 0.78);     // #1f52c7
    vec3 brandCyan = vec3(0.05, 0.55, 0.95);     // Electric Streak

    // Mix base colors using noise f & domain warping r
    vec3 color = mix(baseDark1, baseDark2, clamp(f * f * 4.0, 0.0, 1.0));
    color = mix(color, highlightStreaks, clamp(length(q), 0.0, 1.0) * 0.45);
    color = mix(color, brandBlue, clamp(length(r.x), 0.0, 1.0) * 0.35);
    color += brandCyan * pow(clamp(f, 0.0, 1.0), 3.0) * 0.45;

    // Smooth vignette around edges
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float vignette = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
    vignette = clamp(pow(16.0 * vignette, 0.25), 0.0, 1.0);
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const HeroShaderCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    // Compile Shader Helper
    const createShader = (glContext: WebGLRenderingContext, type: number, source: string) => {
      const shader = glContext.createShader(type);
      if (!shader) return null;
      glContext.shaderSource(shader, source);
      glContext.compileShader(shader);
      if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
        console.error('Shader compile error:', glContext.getShaderInfoLog(shader));
        glContext.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Buffer Quad
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');

    let animationFrameId: number;
    let startTime = performance.now();
    let isVisible = true;

    const resize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.parentElement?.clientWidth || window.innerWidth;
      const height = canvas.parentElement?.clientHeight || window.innerHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // IntersectionObserver to pause rendering when hero is off-screen
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    const render = (now: number) => {
      if (isVisible) {
        const elapsedTime = (now - startTime) * 0.001;
        gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
        gl.uniform1f(timeLocation, elapsedTime);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
    />
  );
};

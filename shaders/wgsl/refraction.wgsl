// CoherynUI GPU Materials — Optical Refraction WGSL Shader (WebGPU)
//
// Calculates per-pixel optical distortion, chromatic aberration (dispersion),
// surface normal perturbation, and specular lighting over authored background textures.

struct Uniforms {
  resolution: vec2<f32>,
  pointer: vec2<f32>,
  strength: f32,
  chromaticDispersion: f32,
  roughness: f32,
  tint: vec4<f32>,
  time: f32,
};

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var backgroundTexture: texture_2d<f32>;
@group(0) @binding(2) var textureSampler: sampler;
@group(0) @binding(3) var normalMap: texture_2d<f32>;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var output: VertexOutput;
  // Full-screen triangle covering [-1, 1]
  var positions = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(3.0, -1.0),
    vec2<f32>(-1.0, 3.0)
  );
  let pos = positions[vertexIndex];
  output.position = vec4<f32>(pos, 0.0, 1.0);
  output.uv = (pos + vec2<f32>(1.0, 1.0)) * 0.5;
  output.uv.y = 1.0 - output.uv.y;
  return output;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  let uv = input.uv;
  
  // Sample surface normal map (perturbed by pointer position)
  let normalSample = textureSample(normalMap, textureSampler, uv).rgb * 2.0 - 1.0;
  let distToPointer = distance(input.position.xy, uniforms.pointer);
  let ripple = sin(distToPointer * 0.05 - uniforms.time * 2.0) * exp(-distToPointer * 0.01) * 0.1;
  let normal = normalize(normalSample + vec3<f32>(0.0, 0.0, 1.0) + vec3<f32>(ripple, ripple, 0.0));

  // Compute optical distortion vector
  let refractionVector = normal.xy * uniforms.strength;

  // Chromatic dispersion: separate sampling for Red, Green, Blue channels
  let dispersion = uniforms.chromaticDispersion * 0.01;
  let uvR = clamp(uv + refractionVector * (1.0 + dispersion), vec2<f32>(0.0), vec2<f32>(1.0));
  let uvG = clamp(uv + refractionVector, vec2<f32>(0.0), vec2<f32>(1.0));
  let uvB = clamp(uv + refractionVector * (1.0 - dispersion), vec2<f32>(0.0), vec2<f32>(1.0));

  let r = textureSample(backgroundTexture, textureSampler, uvR).r;
  let g = textureSample(backgroundTexture, textureSampler, uvG).g;
  let b = textureSample(backgroundTexture, textureSampler, uvB).b;

  // Specular edge highlight
  let lightDir = normalize(vec3<f32>(0.5, 0.8, 1.0));
  let spec = pow(max(dot(normal, lightDir), 0.0), 32.0) * (1.0 - uniforms.roughness);

  var finalColor = vec4<f32>(r, g, b, 1.0);
  finalColor = mix(finalColor, uniforms.tint, uniforms.tint.a);
  finalColor += vec4<f32>(vec3<f32>(spec), 0.0);

  return finalColor;
}

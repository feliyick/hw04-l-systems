#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

// Noise functions:
float random1( vec2 p , vec2 seed) {
  return fract(sin(dot(p + seed, vec2(127.1, 311.7))) * 43758.5453);
}

float interpNoise2d(float x, float y) {
  float intX = floor(x);
  float fractX = fract(x);
  float intY = floor(y);
  float fractY = fract(y);

  float v1 = random1(vec2(intX, intY), vec2(1.f, 1.f));
  float v2 = random1(vec2(intX + 1.f, intY), vec2(1.f, 1.f));
  float v3 = random1(vec2(intX, intY + 1.f), vec2(1.f, 1.f));
  float v4 = random1(vec2(intX + 1.f, intY + 1.f), vec2(1.f, 1.f));

  float i1 = mix(v1, v2, fractX);
  float i2 = mix(v3, v4, fractX);
  return mix(i1, i2, fractY);
  return 2.0;

}

float fbm(float x, float y, float height, float xScale, float yScale) {
  float total = 0.f;
  float persistence = 0.5f;
  int octaves = 8;
  float freq = 2.0;
  float amp = 1.0;
  for (int i = 0; i < octaves; i++) {
    total += interpNoise2d( (x / xScale) * freq, (y / yScale) * freq) * amp;
    freq *= 2.0;
    amp *= persistence;
  }
  return height * total;
}


const vec3 p[5] = vec3[](vec3(0.752, 0.945, 0.968),
                               vec3(0.631, 0.780, 0.886),
                               vec3(0.658, 0.631, 0.886),
                               vec3(0.929, 0.627, 0.490),
                               vec3(0.972, 0.941, 0.827));

vec3 skyMap(vec2 pos) {
    if(pos.y < 0.4) {
        return p[0];
    }
    else if(pos.y < 0.55) {
        return mix(p[0], p[1], (pos.y - 0.4) / 0.15);
    }
    else if(pos.y < 0.65) {
        return mix(p[1], p[2], (pos.y - 0.55) / 0.1);
    }
    else if(pos.y < 0.75) {
        return mix(p[2], p[3], (pos.y - 0.65) / 0.1);
    }
    else if(pos.y < 0.8) {
        return mix(p[3], p[4], (pos.y - 0.75) / 0.05);
    }
    return p[4];
}



void main() {
  vec2 clouds = vec2(fbm(fs_Pos.x  + sin(u_Time * 0.001), fs_Pos.y  + cos(u_Time * 0.001), 1.0, 1.0, 1.0));
  clouds *= 2.0 - vec2(1.0);
  vec2 position = vec2(fs_Pos.x, (fs_Pos.y / 9.0) + 0.6);
  vec3 sky = skyMap(position + clouds * 0.1);

  out_Col = vec4(sky, 1.0);
}
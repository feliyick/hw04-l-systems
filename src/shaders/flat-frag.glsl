#version 300 es
precision highp float;

uniform vec3 u_Eye, u_Ref, u_Up;
uniform vec2 u_Dimensions;
uniform float u_Time;

in vec2 fs_Pos;
out vec4 out_Col;

void main() {
  out_Col = mix(vec4(0.745, 0.933, 0.933, 1), vec4(0.909, 0.933, 0.745, 1), fs_Pos.y);
}

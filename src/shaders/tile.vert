precision mediump float;
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

varying vec2 vTexCoords;
varying vec3 vWorldPos;
varying vec3 vNormal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

uniform sampler2D heightMap;

void main() {
    vTexCoords = uv;
    vWorldPos = mat3(model) * position;
    vNormal = mat3(model) * normal;

    gl_Position =  projection * view * vec4(vWorldPos, 1.0);
}
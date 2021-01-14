precision mediump float;
attribute vec3 position;
attribute vec3 normal;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 vWorld;
varying vec3 vNormal;

void main()
{
    vec3 worldPos = vec3(model * vec4(position, 1.0));
    vNormal = mat3(model) * normal;
    vWorld = worldPos;
    gl_Position =  projection * view * vec4(worldPos, 1.0);
}
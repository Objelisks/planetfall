precision mediump float;
attribute vec3 position;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

void main()
{
    vec3 worldPos = vec3(model * vec4(position, 1.0));
    gl_Position =  projection * view * vec4(worldPos, 1.0);
}
precision mediump float;

vec3 dirLight = vec3(0, -1, 0);

void main() {
    vec3 color = vec3(0.06, 0.197, 0.31);
    gl_FragColor = vec4(color, 0.9);
}
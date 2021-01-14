precision mediump float;

vec3 dirLight = vec3(0, -1, 0);

void main() {
    float ambient = 0.1;
    vec3 color = ambient * vec3(1.0, 0.0, 0.0);
    gl_FragColor = vec4(color, 1.0);
}
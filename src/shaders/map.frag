precision mediump float;

varying vec3 vWorld;
varying vec3 vNormal;

vec3 lightPos = vec3(0, 1, 0);

void main() {
    float ambient = 0.1;
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vec3(0.5, -0.5, 0.5));
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * vec3(0.5);
    vec3 color = (ambient + diffuse) * vec3(1.0, 0.0, 0.0);
    gl_FragColor = vec4(color, 1.0);
}


#extension OES_texture_float : enable
#extension OES_texture_float_linear : enable
#extension WEBGL_color_buffer_float : enable
#extension GL_OES_standard_derivatives : enable
#extension GL_EXT_frag_depth : enable
precision mediump float;

varying vec2 vTexCoords;
varying vec3 vWorldPos;
varying vec3 vNormal;

// material parameters
uniform sampler2D albedoMap;
uniform sampler2D normalMap;
uniform sampler2D metallicMap;
uniform sampler2D roughnessMap;
uniform sampler2D aoMap;
uniform sampler2D heightMap;

// lights
const vec3 lightPosition = vec3(15.0, 10.0, -15.0);
const vec3 lightColor = vec3(1.0, 1.0, 1.0);

uniform vec3 camPos;
uniform float offset;

const float PI = 3.14159265359;
// ----------------------------------------------------------------------------
// Easy trick to get tangent-normals to world-space to keep PBR code simplified.
// Don't worry if you don't get what's going on; you generally want to do normal 
// mapping the usual way for performance anways; I do plan make a note of this 
// technique somewhere later in the normal mapping tutorial.
mat3 calcTBN() {
    vec3 Q1  = dFdx(vWorldPos);
    vec3 Q2  = dFdy(vWorldPos);
    vec2 st1 = dFdx(vTexCoords);
    vec2 st2 = dFdy(vTexCoords);

    vec3 N   = normalize(vNormal);
    vec3 T  = normalize(Q1*st2.t - Q2*st1.t);
    vec3 B  = -normalize(cross(N, T));
    mat3 TBN = mat3(T, B, N);

    return TBN;
}
// ----------------------------------------------------------------------------
float DistributionGGX(vec3 normal, vec3 halfAngle, float roughness)
{
    float a = roughness*roughness;
    float a2 = a*a;
    float NdotH = max(dot(normal, halfAngle), 0.0);
    float NdotH2 = NdotH*NdotH;

    float nom   = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySchlickGGX(float NdotV, float roughness)
{
    float r = (roughness + 1.0);
    float k = (r*r) / 8.0;

    float nom   = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return nom / denom;
}
// ----------------------------------------------------------------------------
float GeometrySmith(vec3 normal, vec3 viewDir, vec3 lightDir, float roughness)
{
    float NdotV = max(dot(normal, viewDir), 0.0);
    float NdotL = max(dot(normal, lightDir), 0.0);
    float ggx2 = GeometrySchlickGGX(NdotV, roughness);
    float ggx1 = GeometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
    return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}
// ----------------------------------------------------------------------------
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness)
{
    return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(1.0 - cosTheta, 5.0);
}   
// ----------------------------------------------------------------------------

void main()
{
    mat3 TBN = calcTBN();
    vec3 viewDir = normalize(camPos - vWorldPos);

    // material properties
    vec3 baseColor = texture2D(albedoMap, vTexCoords).rgb;
    float metallic = texture2D(metallicMap, vTexCoords).r;
    float roughness = texture2D(roughnessMap, vTexCoords).r;
    float ao = texture2D(aoMap, vTexCoords).r;
    float height = texture2D(heightMap, vTexCoords).r;

    vec3 albedo = pow(baseColor, vec3(2.2));

    // input lighting data
    vec3 tangentNormal = texture2D(normalMap, vTexCoords).xyz * 2.0 - 1.0;
    vec3 normal = normalize(TBN * tangentNormal);
    vec3 reflectAngle = reflect(-viewDir, normal); 

    // calculate reflectance at normal incidence; if dia-electric (like plastic) use F0 
    // of 0.04 and if it's a metal, use the albedo color as F0 (metallic workflow)    
    vec3 F0 = vec3(0.04);
    F0 = mix(F0, albedo, metallic);

    // reflectance equation
    vec3 Lo = vec3(0.0);

    // calculate per-light radiance
    vec3 lightDir = normalize(lightPosition);
    vec3 halfAngle = normalize(viewDir + lightDir);
    // float distance = length(lightPosition - vWorldPos);
    // float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColor * 5.0;// * attenuation;

    // Cook-Torrance BRDF
    float NDF = DistributionGGX(normal, halfAngle, roughness);   
    float G   = GeometrySmith(normal, viewDir, lightDir, roughness);    
    vec3 fresnel    = fresnelSchlick(max(dot(halfAngle, viewDir), 0.0), F0);        
    
    vec3 numerator = NDF * G * fresnel;
    float denominator = 4.0 * max(dot(normal, viewDir), 0.0) * max(dot(normal, lightDir), 0.0) + 0.001; // 0.001 to prevent divide by zero.
    vec3 specular = numerator / denominator;
    
    // kS is equal to Fresnel
    vec3 kS = fresnel;
    // for energy conservation, the diffuse and specular light can't
    // be above 1.0 (unless the surface emits light); to preserve this
    // relationship the diffuse component (kD) should equal 1.0 - kS.
    vec3 kD = vec3(1.0) - kS;
    // multiply kD by the inverse metalness such that only non-metals 
    // have diffuse lighting, or a linear blend if partly metal (pure metals
    // have no diffuse light).
    kD *= 1.0 - metallic;	                
        
    // scale light by NdotL
    float NdotL = max(dot(normal, lightDir), 0.0);        

    // add to outgoing radiance Lo
    Lo += (kD * albedo / PI + specular) * radiance * NdotL; // note that we already multiplied the BRDF by the Fresnel (kS) so we won't multiply by kS again

    
    vec3 ambient = vec3(0.03) * albedo * ao;
    vec3 color = ambient + Lo;
    
    // HDR tonemapping
    //color = color / (color + vec3(1.0));
    // gamma correct
    color = pow(color, vec3(1.0/2.2));

    vec2 grid = abs(fract(vWorldPos.xz - 0.5) - 0.5) / (fwidth(vWorldPos.xz) / 2.0);
    color = mix(vec3(0.5, 0.0, 0.0), color, min(1.0, min(grid.x, grid.y)));

    //float offsetVal = texture2D(offset, vTexCoords).r;

    gl_FragColor = vec4(vec3(color), 1.0);
    gl_FragDepthEXT = gl_FragCoord.z - (height+offset)/25500.0;
}
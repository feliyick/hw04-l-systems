#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

uniform mat3 u_CameraAxes; // Used for rendering particles as billboards (quads that are always looking at the camera)
// gl_Position = center + vs_Pos.x * camRight + vs_Pos.y * camUp;

// MY CODE
in vec4 vs_Transform1;
in vec4 vs_Transform2;
in vec4 vs_Transform3;
in vec4 vs_Transform4;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Pos;
out vec4 fs_Nor;
out vec4 fs_LightVec;



void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    vec4 lightPos = vec4(50, 40, 30, 0);


    mat4 transformation = mat4(vs_Transform1, vs_Transform2, vs_Transform3, vs_Transform4);
    vec4 instancedPos = transformation * vs_Pos;
    
    mat3 normalTransform = inverse(transpose(mat3(transformation)));
    fs_Nor = vec4(normalTransform * vec3(vs_Nor), 0.0);

    fs_LightVec = lightPos - instancedPos;  // Compute the direction in which the light source lies

    gl_Position = u_ViewProj * vec4(instancedPos.xyz, 1.0);

}

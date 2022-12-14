import * as THREE from 'three';
import { CSM } from 'three/examples/jsm/csm/CSM';

export const PHONG_SELECT_VERT = `
#define PHONG

varying vec3 vViewPosition;

uniform vec4 selectedID;

attribute vec4 objectID;
attribute vec3 color;
varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

    int marked = 1;

    for(int i = 0; i < 4; ++i)
        marked *= int(floor(selectedID[i] * 255.0 + 0.5) == floor(objectID[i] * 255.0 + 0.5));

    varyingObjectID = float(marked);
	colorFrag = color;

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
`;


export const PHONG_SELECT_FRAG = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>

	vec4 diffuseColor = vec4(diffuse, opacity);
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = clamp(reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance, 0.75, 1.0) * colorFrag;
	
	if (varyingObjectID > 0.5) 
		outgoingLight -= vec3(0.0, 0.6, 0.6); 


	//outgoingLight -= vec3(0.8);
	//vec3 shade = outgoingLight;
	//const vec3 slices = vec3(10.0);
	//const vec3 slices_inv = vec3(1.0) / slices;
	//outgoingLight *= vec3(5.0);
	//outgoingLight *= slices;
	//outgoingLight = floor(outgoingLight + vec3(0.5));
	//outgoingLight *= slices_inv;
	//outgoingLight = pow(outgoingLight, vec3(0.4));
	//outgoingLight *= vec3(0.3);
	//outgoingLight += vec3(0.7);


	#include <envmap_fragment>
	#include <output_fragment>
	#include <tonemapping_fragment>
	#include <encodings_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`;


export function polygonSelectMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.phong.uniforms,
		{ selectedID: { value: [-1, -1, -1, -1] } }
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PHONG_SELECT_VERT,
		fragmentShader: PHONG_SELECT_FRAG,
		lights: true,
		side: THREE.DoubleSide,
		name: 'custom-polygon-material'
	});
}

export const PHONG_LINE_VERT = `
#define PHONG

varying vec3 vViewPosition;

attribute vec3 lineStart;
attribute vec3 lineEnd;
attribute vec3 color;
attribute vec4 objectID;

uniform float zoffset;
uniform vec4 selectedID;
uniform float thickness;

varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup.
 */
mat4 getRotationMat(vec3 vector)
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(vector);
	vec3 cross = cross(f, unit);
	vec3 a = normalize(cross);
	float s = length(cross);
	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);

}

void main() {
    int marked = 1;

    for(int i = 0; i < 4; ++i)
        marked *= int(floor(selectedID[i] * 255.0 + 0.5) == floor(objectID[i] * 255.0 + 0.5));

    varyingObjectID = float(marked);
	colorFrag = color;

	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex> //transformed contains location

	vec3 dir = lineEnd - lineStart;
    float dist = length(dir);
    mat4 rot = getRotationMat(dir);

	float end = float(transformed.x >= 0.9);
	transformed.x = end * (dist + (transformed.x - 1.0) * thickness) + (1.0 - end) * transformed.x * thickness; //subtract one because its the original length of the template line
	transformed.y *= thickness;

    transformed = lineStart + (rot * vec4(transformed, 1.0)).xyz;
	transformed.z += zoffset;

	if (varyingObjectID > 0.5)
		transformed.z += zoffset;

	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = -mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}
`;


export const PHONG_LINE_FRAG = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	//vec4 diffuseColor = vec4(diffuse, opacity);
	//ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	//vec3 totalEmissiveRadiance = emissive;

	//#include <logdepthbuf_fragment>
	//#include <map_fragment>
	//#include <color_fragment>
	//#include <alphamap_fragment>
	//#include <alphatest_fragment>
	//#include <specularmap_fragment>
	//#include <normal_fragment_begin>
	//#include <normal_fragment_maps>
	//#include <emissivemap_fragment>

	// accumulation
	//#include <lights_phong_fragment>
	//#include <lights_fragment_begin>
	//#include <lights_fragment_maps>
	//#include <lights_fragment_end>

	// modulation
	//#include <aomap_fragment>

	//vec3 outgoingLight = clamp(reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance, 0.75, 1.0) * colorFrag;
	vec3 outgoingLight = colorFrag;

	
	if (varyingObjectID > 0.5) 
		outgoingLight -= vec3(0.0, 0.6, 0.6); 


	//#include <envmap_fragment>
	//#include <output_fragment>
	//the output is replaced by the segment bellow
	gl_FragColor = vec4( outgoingLight, 1.0 );

	//#include <tonemapping_fragment>
	//#include <encodings_fragment>
	//#include <fog_fragment>
	//#include <premultiplied_alpha_fragment>
	//#include <dithering_fragment>
}
`;


export function lineMaterial() {
	const customUniforms = THREE.UniformsUtils.merge([
		//THREE.ShaderLib.phong.uniforms,
		{ zoffset: { value: 1 } },
		{ thickness: { value: 1 } },
		{ selectedID: { value: [-1, -1, -1, -1] } }
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PHONG_LINE_VERT,
		fragmentShader: PHONG_LINE_FRAG,
		side: THREE.DoubleSide,
		//lights: true,
		name: 'custom-line-material'
	});
}


export const PHONG_POINT_SELECT_VERT = `
#define PHONG

varying vec3 vViewPosition;

uniform vec4 selectedID;
uniform float pointSize;

attribute vec3 location;
attribute vec4 objectID;
attribute vec3 color;

varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

    int marked = 1;

    for(int i = 0; i < 4; ++i)
        marked *= int(floor(selectedID[i] * 255.0 + 0.5) == floor(objectID[i] * 255.0 + 0.5));

    varyingObjectID = float(marked);
	colorFrag = color;

	//#include <uv_vertex>
	//#include <uv2_vertex>
	//#include <color_vertex>

	//#include <beginnormal_vertex>
	//#include <morphnormal_vertex>
	//#include <skinbase_vertex>
	//#include <skinnormal_vertex>
	//#include <defaultnormal_vertex>
	//#include <normal_vertex>

	#include <begin_vertex>

	transformed *= pointSize;
	transformed += location;

	//#include <morphtarget_vertex>
	//#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	//#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	//#include <envmap_vertex>
	//#include <shadowmap_vertex>
	//#include <fog_vertex>
}
`;


export const PHONG_POINT_SELECT_FRAG = `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

varying float varyingObjectID;
varying vec3 colorFrag;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <uv2_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	#include <clipping_planes_fragment>
	//vec4 diffuseColor = vec4(diffuse, opacity);
	//ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	//vec3 totalEmissiveRadiance = emissive;

	//#include <logdepthbuf_fragment>
	//#include <map_fragment>
	//#include <color_fragment>
	//#include <alphamap_fragment>
	//#include <alphatest_fragment>
	//#include <specularmap_fragment>
	//#include <normal_fragment_begin>
	//#include <normal_fragment_maps>
	//#include <emissivemap_fragment>

	// accumulation
	//#include <lights_phong_fragment>
	//#include <lights_fragment_begin>
	//#include <lights_fragment_maps>
	//#include <lights_fragment_end>

	// modulation
	//#include <aomap_fragment>

	//vec3 outgoingLight = clamp(reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance, 0.75, 1.0) * colorFrag;
	vec3 outgoingLight = colorFrag;

	
	if (varyingObjectID > 0.5) 
		outgoingLight -= vec3(0.0, 0.6, 0.6); 


	//#include <envmap_fragment>
	//#include <output_fragment>
	//the output is replaced by the segment bellow
	gl_FragColor = vec4( outgoingLight, 1.0 );

	//#include <tonemapping_fragment>
	//#include <encodings_fragment>
	//#include <fog_fragment>
	//#include <premultiplied_alpha_fragment>
	//#include <dithering_fragment>
}
`;


export function pointSelectMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		THREE.ShaderLib.phong.uniforms,
		{ selectedID: { value: [-1, -1, -1, -1] } },
		{ pointSize: { value: 1 } },
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PHONG_POINT_SELECT_VERT,
		fragmentShader: PHONG_POINT_SELECT_FRAG,
		lights: true,
		side: THREE.DoubleSide,
		name: 'custom-point-material'
	});
}

export const PICK_VERT = `
attribute vec4 objectID;
varying vec4 objectIDColor;

void main() {
    objectIDColor = objectID;
    gl_Position = projectionMatrix * (modelViewMatrix * vec4( position, 1.0 ));
}
`;


export const PICK_FRAG = `
varying vec4 objectIDColor;

void main() {
	gl_FragColor = vec4(objectIDColor);
}
`;


export function pickingMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PICK_VERT,
		fragmentShader: PICK_FRAG,
		side: THREE.DoubleSide,
		name: 'custom-picking-material'
	});
}


export const PICK_LINE_VERT = `
attribute vec4 objectID;
attribute vec3 lineStart;
attribute vec3 lineEnd;

uniform float zoffset;
uniform float thickness;

varying vec4 objectIDColor;


/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup.
 */
mat4 getRotationMat(vec3 vector)
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(vector);
	vec3 cross = cross(f, unit);
	vec3 a = normalize(cross);
	float s = length(cross);
	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);

}


void main() {
    objectIDColor = objectID;

	vec3 transformed = position;
	vec3 dir = lineEnd - lineStart;
    float dist = length(dir);
    mat4 rot = getRotationMat(dir);

	float end = float(transformed.x >= 0.9);
	transformed.x = end * (dist + (transformed.x - 1.0) * thickness) + (1.0 - end) * transformed.x * thickness; //subtract one because its the original length of the template line
	transformed.y *= thickness;

    transformed = lineStart + (rot * vec4(transformed, 1.0)).xyz;
	transformed.z += zoffset;

    gl_Position = projectionMatrix * (modelViewMatrix * vec4( transformed, 1.0 ));
}
`;


export const PICK_LINE_FRAG = `
varying vec4 objectIDColor;

void main() {
	gl_FragColor = vec4(objectIDColor);
}
`;


export function pickingLineMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		{ zoffset: { value: 1 } },
		{ thickness: { value: 5 } },
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PICK_LINE_VERT,
		fragmentShader: PICK_LINE_FRAG,
		side: THREE.DoubleSide,
		name: 'custom-point-picking-material'
	});
}

export const PICK_POINT_VERT = `
attribute vec4 objectID;
attribute vec3 location;
varying vec4 objectIDColor;

uniform float pointSize;
uniform vec4 selectedID;

void main() {
    objectIDColor = objectID;
    gl_Position = projectionMatrix * (modelViewMatrix * vec4( (pointSize * position) + location, 1.0 ));
}
`;


export const PICK_POINT_FRAG = `
varying vec4 objectIDColor;

void main() {
	gl_FragColor = vec4(objectIDColor);
}
`;


export function pickingPointMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		{ pointSize: { value: 1 } }
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PICK_POINT_VERT,
		fragmentShader: PICK_POINT_FRAG,
		side: THREE.DoubleSide,
		name: 'custom-point-picking-material'
	});
}


export const PICK_AGENT_VERT = `
attribute vec4 objectID;
attribute vec3 from;
attribute vec3 to;
varying vec4 objectIDColor;
uniform float pointSize;
uniform float time;

void main() {
	objectIDColor = objectID;
    gl_Position = projectionMatrix * (modelViewMatrix * vec4( (pointSize * position) + from * (1.0 - time) + to * time, 1.0 ));
}
`;


export const PICK_AGNET_FRAG = `
varying vec4 objectIDColor;

void main() {
	gl_FragColor = vec4(objectIDColor);
}
`;


export function pickingAgentMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		{ pointSize: { value: 1 } },
		{ time: { value: 0 }}
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: PICK_AGENT_VERT,
		fragmentShader: PICK_AGNET_FRAG,
		side: THREE.DoubleSide,
		name: 'custom-agent-picking-material'
	});
}


export const AGENT_VERT = `
attribute vec4 objectID;
attribute vec3 from;
attribute float from_speed;
attribute vec3 to;
attribute float to_speed;

varying float varyingObjectID;
varying float speed;
uniform float pointSize;
uniform vec4 selectedID;
uniform float time;


/**
 * Create rotation matrix from field vector.
 * The returned matrix can rotate vector (1, 0, 0)
 * into the desired setup.
 */
mat4 getRotationMat(vec3 vector)
{
	vec3 unit = vec3(1, 0, 0);
	vec3 f = normalize(vector);
	vec3 cross = cross(f, unit);
	vec3 a = normalize(cross);
	float s = length(cross);
	float c = dot(f, unit);
	float oc = 1.0 - c;
	return mat4(oc * a.x * a.x + c,        oc * a.x * a.y - a.z * s,  oc * a.z * a.x + a.y * s,  0.0,
                oc * a.x * a.y + a.z * s,  oc * a.y * a.y + c,        oc * a.y * a.z - a.x * s,  0.0,
                oc * a.z * a.x - a.y * s,  oc * a.y * a.z + a.x * s,  oc * a.z * a.z + c,        0.0,
                0.0,                       0.0,                       0.0,                       1.0);

}

void main() {
	int marked = 1;

    for(int i = 0; i < 4; ++i)
        marked *= int(floor(selectedID[i] * 255.0 + 0.5) == floor(objectID[i] * 255.0 + 0.5));

    varyingObjectID = float(marked);


	vec3 transformed = position;
	//vec3 dir = from - to;
    //float dist = length(dir);
    //if (dist > 0.01)
	//{
	//	mat4 rot = getRotationMat(dir);
	//	transformed = (rot * vec4(transformed, 1.0)).xyz;
	//}


    gl_Position = projectionMatrix * (modelViewMatrix * vec4( (pointSize * transformed) + from * (1.0 - time) + to * time, 1.0 ));
	speed = clamp((from_speed * (1.0 - time) + to_speed * time) / 20.0, 0.0, 1.0);
}
`;


export const AGENT_FRAG = `
varying float varyingObjectID;
varying float speed;

void main() {
	vec3 color = vec3(1.0 - speed, speed, 0.0) * 0.7 + vec3(0.3, 0.3, 0.3);
	if (varyingObjectID > 0.5) 
		color -= vec3(0.0, 0.6, 0.6); 

	gl_FragColor = vec4(color, 1.0);
}
`;


export function agentSelectMaterial() {

	const customUniforms = THREE.UniformsUtils.merge([
		{ pointSize: { value: 1 } },
		{ time: { value: 0 }},
		{ time: { value: 0 }}
	]);

	return new THREE.ShaderMaterial({
		uniforms: customUniforms,
		vertexShader: AGENT_VERT,
		fragmentShader: AGENT_FRAG,
		side: THREE.DoubleSide,
		name: 'custom-agent-picking-material'
	});
}

export class MaterialLibrary {
    polygonMaterial: THREE.ShaderMaterial;
    pointMaterial: THREE.ShaderMaterial;
    lineMaterial: THREE.ShaderMaterial;
    agentMaterial: THREE.ShaderMaterial;
	
    pickingPolygonMaterial: THREE.ShaderMaterial;
    pickingLineMaterial: THREE.ShaderMaterial;
    pickingPointMaterial: THREE.ShaderMaterial;
    pickingAgentMaterial: THREE.ShaderMaterial;

	constructor(csm: CSM) {        
		this.polygonMaterial = polygonSelectMaterial();
        csm.setupMaterial(this.polygonMaterial);
        this.lineMaterial = lineMaterial();
		this.pointMaterial = pointSelectMaterial();
		this.agentMaterial = agentSelectMaterial();

        this.pickingPolygonMaterial = pickingMaterial();
		this.pickingLineMaterial = pickingLineMaterial();
        this.pickingPointMaterial = pickingPointMaterial();
		this.pickingAgentMaterial = pickingAgentMaterial();
	}

	setPointSize(size: number) {
		this.pointMaterial.uniforms.pointSize.value = size;
		this.pointMaterial.uniformsNeedUpdate = true;
		this.pickingPointMaterial.uniforms.pointSize.value = size;
		this.pickingPointMaterial.uniformsNeedUpdate = true;
		this.agentMaterial.uniforms.pointSize.value = size;
		this.agentMaterial.uniformsNeedUpdate = true;
		this.pickingAgentMaterial.uniforms.pointSize.value = size;
		this.pickingAgentMaterial.uniformsNeedUpdate = true;
	}

	setLineWidth(size: number) {
		this.lineMaterial.uniforms.thickness = { value: size };
		this.lineMaterial.uniformsNeedUpdate = true;
		this.pickingLineMaterial.uniforms.thickness = { value: Math.max(size, 5) };
		this.pickingLineMaterial.uniformsNeedUpdate = true;
	}

	setSelectedID(id: number[]) {
		this.polygonMaterial.uniforms.selectedID = { value: id };
		this.polygonMaterial.uniformsNeedUpdate = true;
		this.lineMaterial.uniforms.selectedID = { value: id };
		this.lineMaterial.uniformsNeedUpdate = true;
		this.pointMaterial.uniforms.selectedID = { value: id };
		this.pointMaterial.uniformsNeedUpdate = true;
		this.pointMaterial.uniforms.selectedID = { value: id };
		this.pointMaterial.uniformsNeedUpdate = true;
	}

	setTime(time: number) {
		this.pickingAgentMaterial.uniforms.time = { value: time - Math.floor(time) };
		this.pickingAgentMaterial.uniformsNeedUpdate = true;	
		this.agentMaterial.uniforms.time = { value: time - Math.floor(time) };
		this.agentMaterial.uniformsNeedUpdate = true;	
	}
}
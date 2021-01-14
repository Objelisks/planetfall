import regl from './libs/regl'
import pbrFragmentShader from './shaders/water.frag'
import pbrVertexShader from './shaders/water.vert'
import { textures, loadTexture } from './reglhelpers.js'

loadTexture('dirt')

const tilePositions = [
  [0, 0, 0],
  [40, 0, 0],
  [0, 0, 40],
  [40, 0, 40]
]
const tileNormals = [
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0],
  [0, 1, 0]
]
const tileUvs = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1]
]

const tileElements = [
  [0, 1, 2],
  [1, 3, 2]
]

// draw heightmap tiles
export const makeWaterRenderer = () => regl({
  frag: pbrFragmentShader,
  vert: pbrVertexShader,
  attributes: {
    position: tilePositions,
    normal: tileNormals,
    uv: tileUvs
  },
  // uniforms: {
  //   albedoMap: (context, props) => textures.dirt.albedoMap,
  //   normalMap: (context, props) => textures.dirt.normalMap,
  //   metallicMap: (context, props) => textures.dirt.metallicMap,
  //   roughnessMap: (context, props) => textures.dirt.roughnessMap,
  //   aoMap: (context, props) => textures.dirt.aoMap,
  //   heightMap: (context, props) => textures.dirt.heightMap,
  //   camPos: (context) => context.eye
  // },
  elements: tileElements,
  blend: {
    enable: true,
    func: { src: 'src alpha', dst: 'one minus src alpha' }
  }
})

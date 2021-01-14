import regl from './libs/regl'
import calcNormals from 'normals'
import { Noise } from 'noisejs'
import { createGridInterpolator } from 'bicubic-interpolate'
import pbrFragmentShader from './shaders/tile.frag'
import pbrVertexShader from './shaders/tile.vert'
import { textures, loadTexture } from './reglhelpers.js'

loadTexture('dirt')
loadTexture('vegetation')

const grid = (width, height, initializer) => {
  const newGrid = []
  for (let x = 0; x < width; x++) {
    newGrid[x] = []
    for (let y = 0; y < height; y++) {
      newGrid[x][y] = initializer(x, y)
    }
  }
  return newGrid
}

const mapGenerator = () => {
  const noise = new Noise(Math.random())
  return (x, y) => {
    const val = noise.perlin2(x / 10 + 100, y / 10 + 100)
    return 0.2 * val + 0.8 * Math.floor(val * 4) / 4
  }
}

const SIZE = 40

export const generateMap = (seed) => {
  const generator = mapGenerator()
  const veg = grid(16, 16, (x, y) => [Math.random(x, y) * 255, 0, 0, 0])
  return {
    width: SIZE,
    height: SIZE,
    heightmap: grid(SIZE, SIZE, (x, y) => generator(x, y) * 2),
    vegetation: regl.texture({ wrapS: 'repeat', wrapT: 'repeat', mag: 'linear', min: 'mipmap', mipmap: true, data: veg })
  }
}

const buildGridQuads = (mapData) => {
  const position = []
  const uv = []
  const elements = []
  const map = mapData.heightmap
  const width = mapData.width
  const height = mapData.height

  const interpolator = createGridInterpolator(map, { extrapolate: true })

  for (let y = 0; y < height; y++) {
    for (let t = 0; t < (y === height - 1 ? 3 : 2); t++) {
      for (let x = 0; x < width; x++) {
        for (let s = 0; s < (x === width - 1 ? 3 : 2); s++) {
          const u = x + s * 0.5
          const v = y + t * 0.5
          const level = interpolator(u, v)// readClamp(x, y, width, height, map)
          position.push([u, level, v])
          uv.push([u / 4, v / 4])
        }
      }
    }
  }
  for (let t = 0; t < 2; t++) {
    for (let y = 0; y < height; y++) {
      for (let s = 0; s < 2; s++) {
        for (let x = 0; x < width; x++) {
          const rel = (u, v) => (y * 2 + t + v) * (width * 2 + 1) + (2 * x + s + u)
          elements.push([rel(0, 0), rel(1, 0), rel(1, 1), rel(0, 1)])
        }
      }
    }
  }

  return {
    position,
    uv,
    elements
  }
}

const trianglulate = (cells) => {
  return cells.flatMap(cell => [[cell[0], cell[1], cell[3]], [cell[1], cell[2], cell[3]]])
}

export const generateMapGeometry = (mapData) => {
  const grid = buildGridQuads(mapData)
  const triangleElements = trianglulate(grid.elements)
  const normals = calcNormals.vertexNormals(triangleElements, grid.position).map(normal => [normal[0], -normal[1], normal[2]])

  return {
    position: grid.position,
    uv: grid.uv,
    elements: triangleElements,
    normal: normals,
    vegetation: mapData.vegetation
  }
}

// cut out triangles and replace with new ones
export const updateMapGeometry = (x, y, w, h, geometry, mapData) => {

}
export const makeMapRenderer = (mapGeometry) => regl({
  frag: pbrFragmentShader,
  vert: pbrVertexShader,
  attributes: {
    position: mapGeometry.position,
    normal: mapGeometry.normal,
    uv: mapGeometry.uv
  },
  uniforms: {
    albedoMap: (context, props) => textures[props.tile].albedoMap,
    normalMap: (context, props) => textures[props.tile].normalMap,
    metallicMap: (context, props) => textures[props.tile].metallicMap,
    roughnessMap: (context, props) => textures[props.tile].roughnessMap,
    aoMap: (context, props) => textures[props.tile].aoMap,
    heightMap: (context, props) => textures[props.tile].heightMap,
    camPos: (context) => context.eye,
    offset: (context, props) => props.offset
  },
  elements: mapGeometry.elements
})

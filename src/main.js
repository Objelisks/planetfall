import regl from './libs/regl'

import { camera } from './camera.js'
import { makeMapRenderer, generateMap, generateMapGeometry } from './map.js'
import { makeWaterRenderer } from './water'

console.log('hello world', regl)

const map = generateMap(1)
const mapData = generateMapGeometry(map)
const renderMap = makeMapRenderer(mapData)

const renderWater = makeWaterRenderer()

regl.frame((context) => {
  regl.clear({
    color: [0, 0, 0, 1.0],
    depth: 1
  })

  camera({
    eye: [-5 * Math.cos(context.time / 10.0), 5, -5 * Math.sin(context.time / 10)],
    target: [5, 0, 5]
  }, (context) => {
    renderMap({ tile: 'dirt', offset: 1.0 })
    renderMap({ tile: 'vegetation', offset: 1.0 + Math.sin(context.time / 5) / 2 })
    renderWater()
  })
})

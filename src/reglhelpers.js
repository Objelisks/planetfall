import regl from './libs/regl.js'
import resl from 'resl'

export const textures = {}

export const waitingOn = {
  count: 0
}

const suffixes = {
  albedo: ['basecolor'],
  normal: ['normal'],
  metallic: ['metallic'],
  roughness: ['roughness'],
  ao: ['ambientocclusion'],
  height: ['height']
}

const texName = (name, type) => {
  return `./src/images/${name}/${name}_${suffixes[type]}.png`
}

export const loadTexture = (name) => {
  const init = { wrapS: 'repeat', wrapT: 'repeat', mag: 'linear', min: 'mipmap', mipmap: true }
  textures[name] = {
    albedoMap: regl.texture(),
    normalMap: regl.texture(),
    metallicMap: regl.texture(),
    roughnessMap: regl.texture(),
    aoMap: regl.texture(),
    heightMap: regl.texture()
  }
  waitingOn.count += 1
  resl({
    manifest: {
      albedo: {
        type: 'image',
        src: texName(name, 'albedo')
      },
      normal: {
        type: 'image',
        src: texName(name, 'normal')
      },
      metallic: {
        type: 'image',
        src: texName(name, 'metallic')
      },
      roughness: {
        type: 'image',
        src: texName(name, 'roughness')
      },
      ao: {
        type: 'image',
        src: texName(name, 'ao')
      },
      height: {
        type: 'image',
        src: texName(name, 'height')
      }
    },
    onDone: (assets) => {
      console.log('textures loaded')
      textures[name].albedoMap({
        ...init,
        data: assets.albedo
      })
      textures[name].normalMap({
        ...init,
        data: assets.normal
      })
      textures[name].metallicMap({
        ...init,
        data: assets.metallic
      })
      textures[name].roughnessMap({
        ...init,
        data: assets.roughness
      })
      textures[name].aoMap({
        ...init,
        data: assets.ao
      })
      textures[name].heightMap({
        ...init,
        data: assets.height
      })
      waitingOn.count -= 1
    },
    onError: (err) => {
      console.error(err)
    }
  })
}

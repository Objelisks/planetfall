import regl from './libs/regl'
import { mat4 } from 'gl-matrix'

export const camera = regl({
  context: {
    projection: (context) => {
      return mat4.perspective(
        [],
        Math.PI / 4,
        context.viewportWidth / context.viewportHeight,
        0.1,
        200.0
      )
    },

    view: (context, props) => {
      return mat4.lookAt([], props.eye, props.target, [0, 1, 0])
    },

    eye: regl.prop('eye'),
    target: regl.prop('target')
  },

  uniforms: {
    view: regl.context('view'),
    model: () => mat4.create(),
    invView: (context) => mat4.invert([], context.view),
    projection: regl.context('projection')
  }
})

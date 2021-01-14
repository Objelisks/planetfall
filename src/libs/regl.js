import createREGL from 'regl'

const regl = createREGL({
  canvas: document.body.querySelector('#render'),
  extensions: [
    'WEBGL_color_buffer_float',
    'OES_standard_derivatives',
    'OES_texture_float',
    'OES_texture_float_linear',
    'EXT_frag_depth'
  ]
})

export default regl

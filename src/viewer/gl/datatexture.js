/**
 * A data texture.
 */
export default class DataTexture {
  /**
   * @param {WebGLRenderingContext} gl
   * @param {?number} width
   * @param {?number} height
   */
  constructor(gl, width = 2, height = 2) {
    /** @member {WebGLRenderingContext} */
    this.gl = gl;
    /** @member {WebGLBuffer} */
    this.texture = gl.createTexture();
    /** @member {number} */
    this.width = 0;
    /** @member {number} */
    this.height = 0;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    this.reserve(width, height);
  }

  /**
  * @param {number} width
  * @param {number} height
  */
  reserve(width, height) {
    if (this.width < width || this.height < this.height) {
      const gl = this.gl;

      this.width = Math.max(this.width, width);
      this.height = Math.max(this.height, height);

      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.FLOAT, null);
    }
  }

  /**
  * @param {number} width
  * @param {number} height
  * @param {ArrayBuffer|TypedArray} buffer
  */
  bindAndUpdate(width, height, buffer) {
    const gl = this.gl;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, width, height, gl.RGBA, gl.FLOAT, buffer);
  }
}

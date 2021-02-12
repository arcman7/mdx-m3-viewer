import { bytesOf } from './typecast';

/**
 * A bit stream.
 */
export default class BitStream {
  buffer: ArrayBuffer;
  uint8array: Uint8Array;
  index: number = 0;
  byteLength: number;
  bitBuffer: number = 0;
  bits: number = 0;

  constructor(buffer: ArrayBuffer | Uint8Array, byteOffset?: number, byteLength?: number) {
    let bytes = bytesOf(buffer);

    // For browsers not supporting the spec.
    // Once upon a time I reported this issue on the Firefox tracker.
    // Seems like Safari needs an issue report too.
    byteOffset = byteOffset || 0;
    byteLength = byteLength || bytes.length;

    this.buffer = buffer;
    this.uint8array = bytes.subarray(byteOffset, byteOffset + byteLength);
    this.byteLength = buffer.byteLength;
  }

  /**
   * Peek a number of bits.
   */
  peekBits(bits: number) {
    this.loadBits(bits);

    return this.bitBuffer & ((1 << bits) - 1);
  }

  /**
   * Read a number of bits.
   */
  readBits(bits: number) {
    let data = this.peekBits(bits);

    this.bitBuffer >>>= bits;
    this.bits -= bits;

    return data;
  }

  /**
   * Skip a number of bits.
   */
  skipBits(bits: number) {
    this.loadBits(bits);

    this.bitBuffer >>>= bits;
    this.bits -= bits;
  }

  /**
   * Load more bits into the buffer.
   */
  loadBits(bits: number) {
    while (this.bits < bits) {
      this.bitBuffer += this.uint8array[this.index] << this.bits;
      this.bits += 8;
      this.index += 1;
    }
  }
}

import Camera from '../../../parsers/m3/camera';

/**
 * An M3 camera.
 */
export default class M3Camera {
  bone: number;
  name: string;

  constructor(camera: Camera) {
    this.bone = camera.bone;
    this.name = <string>camera.name.get();

    // / TODO: Add animated getters, much like the Mdx structures.
    /*
    this.fieldOfView = new AnimationReference(reader, readFloat32);
    this.farClip = new AnimationReference(reader, readFloat32);
    this.nearClip = new AnimationReference(reader, readFloat32);
    this.clip2 = new AnimationReference(reader, readFloat32);
    this.focalDepth = new AnimationReference(reader, readFloat32);
    this.falloffStart = new AnimationReference(reader, readFloat32);
    this.falloffEnd = new AnimationReference(reader, readFloat32);
    this.depthOfField = new AnimationReference(reader, readFloat32);
    */
  }
}

import Bone from '../../../parsers/m3/bone';
import { Uint32AnimationReference, Vector3AnimationReference, Vector4AnimationReference } from '../../../parsers/m3/animationreference';

/**
 * An M3 bone.
 */
export default class M3Bone {
  name: string;
  parent: number;
  location: Vector3AnimationReference;
  rotation: Vector4AnimationReference;
  scale: Vector3AnimationReference;
  visibility: Uint32AnimationReference;
  inhertTranslation: number;
  inheritScale: number;
  inheritRotation: number;
  billboard1: number;
  billboard2: number;
  twoDProjection: number;
  animated: number;
  inverseKinematics: number;
  skinned: number;
  real: number;

  constructor(bone: Bone) {
    let flags = bone.flags;

    this.name = <string>bone.name.get();
    this.parent = bone.parent;
    this.location = bone.location;
    this.rotation = bone.rotation;
    this.scale = bone.scale;
    this.visibility = bone.visibility;
    this.inhertTranslation = flags & 0x1;
    this.inheritScale = flags & 0x2;
    this.inheritRotation = flags & 0x4;
    this.billboard1 = flags & 0x10;
    this.billboard2 = flags & 0x40;
    this.twoDProjection = flags & 0x100;
    this.animated = flags & 0x200;
    this.inverseKinematics = flags & 0x400;
    this.skinned = flags & 0x800;
    this.real = flags & 0x2000;
  }
}

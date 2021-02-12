import urlWithParams from '../../../common/urlwithparams';
import { decodeAudioData } from '../../../common/audio';
import { FetchDataType } from '../../../common/fetchdatatype';
import { MappedData } from '../../../utils/mappeddata';
import EventObject from '../../../parsers/mdlx/eventobject';
import Texture from '../../texture';
import GenericResource from '../../genericresource';
import MdxModel from './model';
import GenericObject from './genericobject';
import { emitterFilterMode } from './filtermode';
import { EMITTER_SPLAT, EMITTER_UBERSPLAT } from './geometryemitterfuncs';
import MdxModelInstance from './modelinstance';
import MdxTexture from './texture';
import { PathSolver } from '../../handlerresource';

const mappedDataCallback = (data: FetchDataType) => new MappedData(<string>data);
const decodedDataCallback = (data: FetchDataType) => decodeAudioData(<ArrayBuffer>data);

/**
 * An event object.
 */
export default class EventObjectEmitterObject extends GenericObject {
  geometryEmitterType: number = -1;
  type: string;
  id: string;
  tracks: Uint32Array;
  globalSequence: number = -1;
  defval: Uint32Array = new Uint32Array(1);
  internalModel: MdxModel | null = null;
  internalTexture: MdxTexture | null = null;
  colors: Float32Array[] = [];
  intervalTimes: Float32Array = new Float32Array(3);
  scale: number = 0;
  columns: number = 0;
  rows: number = 0;
  lifeSpan: number = 0;
  blendSrc: number = 0;
  blendDst: number = 0;
  intervals: Float32Array[] = [];
  distanceCutoff: number = 0;
  maxDistance: number = 0;
  minDistance: number = 0;
  pitch: number = 0;
  pitchVariance: number = 0;
  volume: number = 0;
  decodedBuffers: AudioBuffer[] = [];
  ok: boolean = false;

  constructor(model: MdxModel, eventObject: EventObject, index: number) {
    super(model, eventObject, index);

    let viewer = model.viewer;
    let name = eventObject.name;
    let type = name.substring(0, 3);
    let id = name.substring(4);

    // Same thing
    if (type === 'FPT') {
      type = 'SPL';
    }

    if (type === 'SPL') {
      this.geometryEmitterType = EMITTER_SPLAT;
    } else if (type === 'UBR') {
      this.geometryEmitterType = EMITTER_UBERSPLAT;
    }

    this.type = type;
    this.id = id;
    this.tracks = eventObject.tracks;

    let globalSequenceId = eventObject.globalSequenceId;
    if (globalSequenceId !== -1) {
      this.globalSequence = model.globalSequences[globalSequenceId];
    }

    let tables = [];
    let pathSolver = model.pathSolver;

    // Nothing to do without a path solver.
    if (!pathSolver) {
      return;
    }

    // Sometimes TS isn't the brightest.
    let pathSolverAsPathSolver = <PathSolver>pathSolver;

    let solverParams = model.solverParams;

    if (type === 'SPN') {
      tables[0] = viewer.loadGeneric(urlWithParams(pathSolver('Splats\\SpawnData.slk'), solverParams), 'text', mappedDataCallback);
    } else if (type === 'SPL') {
      tables[0] = viewer.loadGeneric(urlWithParams(pathSolver('Splats\\SplatData.slk'), solverParams), 'text', mappedDataCallback);
    } else if (type === 'UBR') {
      tables[0] = viewer.loadGeneric(urlWithParams(pathSolver('Splats\\UberSplatData.slk'), solverParams), 'text', mappedDataCallback);
    } else if (type === 'SND') {
      if (!model.reforged) {
        tables.push(viewer.loadGeneric(urlWithParams(pathSolver('UI\\SoundInfo\\AnimLookups.slk'), solverParams), 'text', mappedDataCallback));
      }

      tables.push(viewer.loadGeneric(urlWithParams(pathSolver('UI\\SoundInfo\\AnimSounds.slk'), solverParams), 'text', mappedDataCallback));
    } else {
      // Units\Critters\BlackStagMale\BlackStagMale.mdx has an event object named "Point01".
      return;
    }

    let resolve = viewer.promise();

    Promise.all(tables)
      .then((tables) => {
        for (let table of tables) {
          if (!table) {
            resolve();

            return;
          }
        }

        let tablesAsGeneric = <GenericResource[]>tables;
        let firstTable = <MappedData>tablesAsGeneric[0].data;
        let row = firstTable.getRow(this.id);

        if (row) {
          if (type === 'SPN') {
            viewer.load((<string>row.Model).replace('.mdl', '.mdx'), pathSolverAsPathSolver, model.solverParams)
              .then((model) => {
                if (model) {
                  this.internalModel = <MdxModel>model;
                  this.ok = true;
                }
              });
          } else if (type === 'SPL' || type === 'UBR') {
            let texturesExt = model.reforged ? '.dds' : '.blp';

            this.internalTexture = new MdxTexture(0, true, true);

            viewer.load(`replaceabletextures/splats/${row.file}${texturesExt}`, pathSolverAsPathSolver, model.solverParams)
              .then((texture) => {
                if (texture) {
                  (<MdxTexture>this.internalTexture).texture = <Texture>texture;
                  this.ok = true;
                }
              });

            this.scale = <number>row.Scale;
            this.colors[0] = new Float32Array([<number>row.StartR, <number>row.StartG, <number>row.StartB, <number>row.StartA]);
            this.colors[1] = new Float32Array([<number>row.MiddleR, <number>row.MiddleG, <number>row.MiddleB, <number>row.MiddleA]);
            this.colors[2] = new Float32Array([<number>row.EndR, <number>row.EndG, <number>row.EndB, <number>row.EndA]);

            if (type === 'SPL') {
              this.columns = <number>row.Columns;
              this.rows = <number>row.Rows;
              this.lifeSpan = <number>row.Lifespan + <number>row.Decay;

              this.intervalTimes[0] = <number>row.Lifespan;
              this.intervalTimes[1] = <number>row.Decay;

              this.intervals[0] = new Float32Array([<number>row.UVLifespanStart, <number>row.UVLifespanEnd, <number>row.LifespanRepeat]);
              this.intervals[1] = new Float32Array([<number>row.UVDecayStart, <number>row.UVDecayEnd, <number>row.DecayRepeat]);
            } else {
              this.columns = 1;
              this.rows = 1;
              this.lifeSpan = <number>row.BirthTime + <number>row.PauseTime + <number>row.Decay;

              this.intervalTimes[0] = <number>row.BirthTime;
              this.intervalTimes[1] = <number>row.PauseTime;
              this.intervalTimes[2] = <number>row.Decay;
            }

            let blendModes = emitterFilterMode(<number>row.BlendMode, viewer.gl);

            this.blendSrc = blendModes[0];
            this.blendDst = blendModes[1];

            this.ok = true;
          } else if (type === 'SND') {
            // Only load sounds if audio is enabled.
            // This is mostly to save on bandwidth and loading time, especially when loading full maps.
            if (viewer.audioEnabled) {
              let animSounds = <MappedData>tablesAsGeneric[1].data;

              row = animSounds.getRow(<string>row.SoundLabel);

              if (row) {
                this.distanceCutoff = <number>row.DistanceCutoff;
                this.maxDistance = <number>row.MaxDistance;
                this.minDistance = <number>row.MinDistance;
                this.pitch = <number>row.Pitch;
                this.pitchVariance = <number>row.PitchVariance;
                this.volume = <number>row.Volume;

                let fileNames = (<string>row.FileNames).split(',');
                let resources = fileNames.map((fileName) => viewer.loadGeneric(urlWithParams(pathSolverAsPathSolver(row.DirectoryBase + fileName), model.solverParams), 'arrayBuffer', decodedDataCallback));

                Promise.all(resources)
                  .then((resources) => {
                    for (let resource of resources) {
                      this.decodedBuffers.push((<GenericResource>resource).data);
                    }

                    this.ok = true;
                  });
              }
            }
          }
        } else {
          console.warn('Unknown event object ID', type, this.id);
        }

        resolve();
      });
  }

  getValue(out: Uint32Array, instance: MdxModelInstance) {
    if (this.globalSequence !== -1) {
      let globalSequence = this.globalSequence;

      return this.getValueAtTime(out, instance.counter % globalSequence, 0, globalSequence);
    } else if (instance.sequence !== -1) {
      let interval = this.model.sequences[instance.sequence].interval;

      return this.getValueAtTime(out, instance.frame, interval[0], interval[1]);
    } else {
      out[0] = this.defval[0];

      return -1;
    }
  }

  getValueAtTime(out: Uint32Array, frame: number, start: number, end: number) {
    let tracks = this.tracks;

    if (frame >= start && frame <= end) {
      for (let i = tracks.length - 1; i > -1; i--) {
        if (tracks[i] < start) {
          out[0] = 0;

          return i;
        } else if (tracks[i] <= frame) {
          out[0] = 1;

          return i;
        }
      }
    }

    out[0] = 0;

    return -1;
  }
}

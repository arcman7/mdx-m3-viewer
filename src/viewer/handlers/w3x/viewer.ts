import { FetchDataTypeName } from '../../../common/fetchdatatype';
import { MappedData } from '../../../utils/mappeddata';
import ModelViewer from '../../viewer';
import Shader from '../../gl/shader';
import { PathSolver } from '../../handlerresource';
import mdxHandler from '../mdx/handler';
import blpHandler from '../blp/handler';
import tgaHandler from '../tga/handler';
import ddsHandler from '../dds/handler';
import groundVert from './shaders/ground.vert';
import groundFrag from './shaders/ground.frag';
import waterVert from './shaders/water.vert';
import waterFrag from './shaders/water.frag';
import cliffsVert from './shaders/cliffs.vert';
import cliffsFrag from './shaders/cliffs.frag';
import War3MapViewerMap from './map';

export default class War3MapViewer extends ModelViewer {
  wc3PathSolver: PathSolver;
  groundShader: Shader;
  waterShader: Shader;
  cliffShader: Shader;
  terrainData: MappedData = new MappedData();
  cliffTypesData: MappedData = new MappedData();
  waterData: MappedData = new MappedData();
  doodadsData: MappedData = new MappedData();
  doodadMetaData: MappedData = new MappedData();
  destructableMetaData: MappedData = new MappedData();
  unitsData: MappedData = new MappedData();
  unitMetaData: MappedData = new MappedData();
  loadedBaseFiles: boolean = false;
  map: War3MapViewerMap | null = null;

  constructor(canvas: HTMLCanvasElement, wc3PathSolver: PathSolver) {
    super(canvas);

    let webgl = this.webgl;

    // Data textures.
    if (!webgl.ensureExtension('OES_texture_float')) {
      throw new Error('War3MapViewer: No float texture support!');
    }

    // Optionally used for cliff renering.
    if (!webgl.ensureExtension('OES_vertex_array_object')) {
      console.warn('War3MapViewer: No vertex array object support! This might reduce performance.');
    }

    this.on('error', (e) => console.log(e));

    this.addHandler(mdxHandler, wc3PathSolver); /// TODO: If Reforged support is wanted proper, the team colors/glows should be reloaded based on the map.
    this.addHandler(blpHandler);
    this.addHandler(tgaHandler);
    this.addHandler(ddsHandler);

    this.wc3PathSolver = wc3PathSolver;

    this.groundShader = this.webgl.createShader(groundVert, groundFrag);
    this.waterShader = this.webgl.createShader(waterVert, waterFrag);
    this.cliffShader = this.webgl.createShader(cliffsVert, cliffsFrag);

    this.loadBaseFiles();
  }

  async loadBaseFiles() {
    let promises = [
      this.loadBaseFile('TerrainArt\\Terrain.slk', 'text'),
      this.loadBaseFile('TerrainArt\\CliffTypes.slk', 'text'),
      this.loadBaseFile('TerrainArt\\Water.slk', 'text'),
      this.loadBaseFile('Doodads\\Doodads.slk', 'text'),
      this.loadBaseFile('Doodads\\DoodadMetaData.slk', 'text'),
      this.loadBaseFile('Units\\DestructableData.slk', 'text'),
      this.loadBaseFile('Units\\DestructableMetaData.slk', 'text'),
      this.loadBaseFile('Units\\UnitData.slk', 'text'),
      this.loadBaseFile('Units\\unitUI.slk', 'text'),
      this.loadBaseFile('Units\\ItemData.slk', 'text'),
      this.loadBaseFile('Units\\UnitMetaData.slk', 'text'),
    ];

    let [terrain, cliffTypes, water, doodads, doodadMetaData, destructableData, destructableMetaData, unitData, unitUi, itemData, unitMetaData] = await Promise.all(promises);

    if (!terrain || !cliffTypes || !water || !doodads || !doodadMetaData || !destructableData || !destructableMetaData || !unitData || !unitUi || !itemData || !unitMetaData) {
      throw new Error('Failed to load the base files');
    }

    this.terrainData.load(terrain.data);
    this.cliffTypesData.load(cliffTypes.data);
    this.waterData.load(water.data);
    this.doodadsData.load(doodads.data);
    this.doodadMetaData.load(doodadMetaData.data);
    this.doodadsData.load(destructableData.data);
    this.destructableMetaData.load(destructableMetaData.data);
    this.unitsData.load(unitData.data);
    this.unitsData.load(unitUi.data);
    this.unitsData.load(itemData.data);
    this.unitMetaData.load(unitMetaData.data);

    this.loadedBaseFiles = true;
    this.emit('loadedbasefiles');
  }
<<<<<<< HEAD
  // added optional aPathSolver param to load in non-wc3 models
  load(src: any, aPathSolver?: any) {
    return super.load(src, aPathSolver || <PathSolver>this.mapPathSolver, this.solverParams);
  }

  loadMapGeneric(path: string, dataType: FetchDataTypeName) {
    return super.loadGeneric(urlWithParams(this.wc3PathSolver(path), this.solverParams), dataType);
=======

  loadBaseFile(path: string, dataType: FetchDataTypeName) {
    return super.loadGeneric(this.wc3PathSolver(path), dataType);
>>>>>>> 375054ea3bb04522ad3978d4be3e25633cdf2dff
  }

  /**
   * Load a map from a buffer.
   */
  loadMap(buffer: ArrayBuffer | Uint8Array) {
    if (this.loadedBaseFiles) {
      if (this.map) {
        this.map.die();
      }

      this.map = new War3MapViewerMap(this, buffer);
    }
  }

  /**
   * Update the map.
   */
  update() {
    if (this.map) {
      super.update();

<<<<<<< HEAD
      let instances = <MdxModelInstance[]>this.worldScene.instances;

      for (let instance of instances) {
        if (instance.sequenceEnded || instance.sequence === -1 && instance.userSetSequence !== true) {
          randomStandSequence(instance);
        }
      }
=======
      this.map.update();
>>>>>>> 375054ea3bb04522ad3978d4be3e25633cdf2dff
    }
  }

  /**
   * Render the map.
   */
  render() {
    if (this.map) {
      this.map.render();
    }
  }
}

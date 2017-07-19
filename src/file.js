import DownloadableResource from "./downloadableresource";
import { mix } from "./common";

/**
 * @constructor
 * @augments DownloadableResource
 * @param {ModelViewer} env
 * @param {function(?)} pathSolver
 */
function ViewerFile(env, pathSolver) {
    DownloadableResource.call(this, env, pathSolver);
}

ViewerFile.prototype = {
    get objectType() {
        return "file";
    }
};

mix(ViewerFile.prototype, DownloadableResource.prototype);

export default ViewerFile;

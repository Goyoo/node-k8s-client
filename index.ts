import _api = require('./lib/request');

namespace K8s {
    export type K8sRequest = _api.Request;
    export var api = require('./lib/request');
    export var kubectl = require('./lib/kubectl');
}

export default K8s;

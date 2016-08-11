import _api = require('./lib/request');

namespace K8s {
    export var api = require('./lib/request');
    export var kubectl = require('./lib/kubectl');
}

export = K8s;

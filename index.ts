import { Request } from './lib/request'

namespace K8s {
    export type K8sRequest = Request
    export var api = (conf) => {
        return new Request(conf)
    }
    export var kubectl = require('./lib/kubectl')
}

export = K8s

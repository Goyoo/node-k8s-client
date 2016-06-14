import _api = require('./lib/request')

module K8s{
    export var api = require('./lib/request')
    export var kubectl = require('./lib/kubectl')
}

module.exports = K8s
 
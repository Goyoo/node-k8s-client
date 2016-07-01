import _api = require('./lib/request')
import _kubectl = require('./lib/kubectl')

export var api = _api.main
export var kubectl = _kubectl.main

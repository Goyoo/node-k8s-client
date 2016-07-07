import _api = require('./lib/request');
import _kubectl = require('./lib/kubectl');

export type k8sRequest = _api.Request;
export var k8sApi = _api.main;
export var api = _api.main;
export var kubectl = _kubectl.main;

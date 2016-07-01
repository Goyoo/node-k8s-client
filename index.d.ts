import _api = require('./lib/request');
import _kubectl = require('./lib/kubectl');
export declare var api: (conf: any) => _api.Request;
export declare var kubectl: (conf: any) => {
    pod: _kubectl.Kubectl;
    rc: _kubectl.Kubectl;
    service: _kubectl.Kubectl;
    node: _kubectl.Kubectl;
};

export declare class Kubectl {
    private type;
    private binary;
    private kubeconfig;
    private namespace;
    private endpoint;
    constructor(type: any, conf: any);
    private spawn(args, done);
    private callbackFunction(primise, callback);
    command(cmd: any, callback: any): Promise<any>;
    list(selector: any, flags?: any, done?: any): Promise<any>;
    get(name: string, flags?: any, done?: (err, data) => void): Promise<any>;
    create(filepath: string, flags?: any, done?: (err, data) => void): Promise<any>;
    delete(id: string, flags: any, done?: (err, data) => void): Promise<any>;
    update(filepath: string, flags?: any, done?: (err, data) => void): Promise<any>;
    apply(name: string, json: Object, flags?: any, done?: (err, data) => void): Promise<any>;
    rollingUpdateByFile(name: string, filepath: string, flags?: any, done?: (err, data) => void): Promise<any>;
    rollingUpdate(name: string, image: string, flags?: any, done?: (err, data) => void): Promise<any>;
    scale(name: string, replicas: string, flags?: any, done?: (err, data) => void): Promise<any>;
    logs(name: string, flags?: any, done?: (err, data) => void): Promise<any>;
    portForward(name: string, portString: string, done?: (err, data) => void): Promise<any>;
    useContext(context: string, done?: (err, data) => void): Promise<any>;
    viewContext(done?: (err, data) => void): void;
}
export declare var main: (conf: any) => {
    pod: Kubectl;
    rc: Kubectl;
    service: Kubectl;
    node: Kubectl;
};

export declare class Request {
    private authtype;
    private username;
    private password;
    private ignoreCerts;
    private domain;
    constructor(conf: any);
    private callbackFunction(primise, callback);
    private getRequestOptions(path, opts?);
    get(url: string, done?: any): Promise<any>;
    post(url: any, body: any, done?: any): Promise<any>;
    put(url: any, body: any, done?: any): Promise<any>;
    patch(url: any, body: any, done?: any): Promise<any>;
    delete(url: any, json?: any, done?: any): Promise<any>;
    watch(url: any, message?: any, exit?: any, timeout?: any): any;
}
export declare var main: (conf: any) => Request;

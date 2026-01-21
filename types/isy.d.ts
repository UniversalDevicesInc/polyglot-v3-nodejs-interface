type IsyInfo = {
    isy_https: number;
    isy_ip_address: any;
    isy_port: any;
    isy_username: any;
    isy_password: any;
};
export declare class ISY {
    isyInfo: IsyInfo;
    isyURL: string;
    constructor(isyInfo: IsyInfo);
    _info(): void;
    getInv(URL: string): Promise<any>;
    runCmd(API: string): Promise<any>;
    nodes(json?: boolean): Promise<string>;
    intVars(json?: boolean): Promise<string>;
    stateVars(json?: boolean): Promise<string>;
    programs(json?: boolean): Promise<string>;
    netResources(json?: boolean): Promise<string>;
}
export {};

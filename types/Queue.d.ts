export default class dataq {
    qname: any;
    pool: any[];
    Qprocessing: number;
    dataProcessor: any;
    context: any;
    constructor(cb: any, callerContext: any, name: any);
    add(item: any): void;
    process(): void;
}

import type { Interface } from './Interface.js';
type NodeDefId = 'UNDEFINED';
export declare const nodeDefId: NodeDefId;
type GenericCommands = Record<string, (message?: any) => void | Promise<void>>;
type GenericDrivers = Record<string, {
    value: string;
    uom: number;
    changed?: boolean;
}>;
export declare class Node<P extends string = string, Commands extends GenericCommands = GenericCommands, Drivers extends GenericDrivers = GenericDrivers> {
    id: P;
    static nodeDefId: any;
    polyInterface: Interface;
    primary: any;
    address: any;
    name: any;
    timeAdded: Date;
    enabled: boolean;
    added: boolean;
    commands: Commands;
    drivers: Drivers;
    hint: boolean;
    constructor(nodeDefId: P, polyInterface: Interface, primary: any, address: any, name: any);
    getDriver(driver: keyof Drivers): Drivers[keyof Drivers];
    convertValue(driver: keyof Drivers, value: {
        toString: () => any;
    }): string | {
        toString: () => any;
    };
    setDriver(driver: keyof Drivers, value: any, report?: boolean, forceReport?: boolean, uom?: any): void;
    reportDriver(driver: keyof Drivers, forceReport?: boolean): void;
    reportDrivers(forceReport?: boolean): void;
    reportCmd(command: keyof Commands, value?: any, uom?: any): void;
    query(): void;
    status(): void;
    delNode(): void;
    rename(newName: string): void;
    runCmd(cmdMessage: {
        cmd: keyof Commands;
    }): Promise<object & Record<"then", unknown>>;
    _asyncWrapper(result: unknown): object & Record<"then", unknown>;
}
export {};

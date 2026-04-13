declare module 'mathjs' {
    export function mean(...args: any[]): number;
    export function median(...args: any[]): number;
    export function std(...args: any[]): number;
    export function variance(...args: any[]): number;
    export function min(...args: any[]): number;
    export function max(...args: any[]): number;
    export function sum(...args: any[]): number;
    export function round(x: number, n?: number): number;
}

declare module 'exceljs' {
    const mod: any;
    export = mod;
}

declare module '@anthropic-ai/sdk' {
    class Anthropic {
        constructor(opts?: { apiKey?: string });
        messages: {
            create(params: any): Promise<any>;
        };
    }
    export default Anthropic;
}

declare module 'pdfmake/build/pdfmake' {
    const pdfMake: any;
    export = pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
    const vfsFonts: any;
    export = vfsFonts;
}

declare module 'papaparse' {
    const Papa: any;
    export = Papa;
}

declare module 'archiver' {
    const archiver: any;
    export = archiver;
}

declare module "better-sqlite3" {
  export interface Statement<T = unknown> {
    all(...params: readonly unknown[]): T[];
    get(...params: readonly unknown[]): T | undefined;
    run(...params: readonly unknown[]): { changes: number };
  }

  export interface FunctionOptions {
    deterministic?: boolean;
  }

  export interface Database {
    prepare<T = unknown>(sql: string): Statement<T>;
    exec(sql: string): this;
    close(): void;
    transaction(fn: () => void): () => void;
    function(name: string, fn: (...args: unknown[]) => unknown): this;
    function(name: string, options: FunctionOptions, fn: (...args: unknown[]) => unknown): this;
  }

  export interface Options {
    readonly?: boolean;
    fileMustExist?: boolean;
  }

  const DatabaseConstructor: new (filename: string, options?: Options) => Database;
  export default DatabaseConstructor;
}

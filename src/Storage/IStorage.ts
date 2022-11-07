export interface IStorage {
  /**
   * Return a value.
   *
   * @param key A string.
   * @return The stored value or `undefined`.
   */
  get<T>(key: string): T | undefined;

  /**
   * Return a value.
   *
   * @param key A string.
   * @param defaultValue A value that should be returned when there is no
   * value (`undefined`) with the given key.
   * @return The stored value or the defaultValue.
   */
  get<T>(key: string, defaultValue: T): T;

  /**
   * Store a value. The value must be JSON-stringifyable.
   *
   * *Note* that using `undefined` as value removes the key from the underlying
   * storage.
   *
   * @param key A string.
   * @param value A value. MUST not contain cyclic references.
   */
  update(key: string, value: unknown): Thenable<void>;

  /** Import data from one storage to another */
  import(data: Record<string, any>): Thenable<void>;

  /** Get all data */
  export(): Record<string, any>;

  /** Clear storage */
  clear(): Thenable<void>;
}

/* eslint-disable no-extend-native */

export {};

declare global {
  interface Map<K, V> {
    getSetDefault(key: K, defaultValue: V | (() => V)): V;
    getDefault(key: K, defaultValue: V | (() => V)): V;
  }
}
Map.prototype.getDefault = function getSetDefault(key, defaultValue) {
  const def = defaultValue instanceof Function ? defaultValue() : defaultValue;
  return this.get(key) || def;
};
Map.prototype.getSetDefault = function getSetDefault(key, defaultValue) {
  const ret = this.get(key);
  const def = defaultValue instanceof Function ? defaultValue() : defaultValue;
  if (ret === undefined) {
    this.set(key, def);
    return def;
  }
  return ret;
};

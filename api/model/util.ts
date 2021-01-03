/**
 * util.ts stores the utility functions of the model.
 */
import {Model, DBObject} from './type';

/**
 * Convert the any type data into the provided props key
 * @param {string[]} keys
 * @param {any} data
 * @return {any}
 */
export const convertToMod = (keys: string[], data: Model): Model => {
  const newObj: Model = {} as Model;

  for (const key of keys) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) return null as any;
    else newObj[key] = data[key];
  }

  return newObj;
};
/**
 * Check if target data is a certain Model type with key props
 * @param {string[]} keys
 * @param {DBObject} data
 * @return {boolean}
 */

export const instanceOf = (keys: string[], data: DBObject): boolean => {
  for (const key of keys) {
    if (!(key in data)) return false;
  }

  return true;
};
/**
 * Make sure the next Model's version is exactly one above
 * @param {Model} current
 * @param {Model} next
 * @return {boolean}
 */

export const isNextVersion = <T extends Model>(
  current: T,
  next: T
): boolean => {
  return next.version - current.version === 1;
};

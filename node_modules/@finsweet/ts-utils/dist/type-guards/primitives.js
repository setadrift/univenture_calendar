/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
export const isString = (value) => typeof value === 'string';
export const isNumber = (value) => typeof value === 'number';
export const isBigint = (value) => typeof value === 'bigint';
export const isBoolean = (value) => typeof value === 'boolean';
export const isSymbol = (value) => typeof value === 'symbol';
export const isUndefined = (value) => value === undefined;
export const isNull = (value) => value === null;
export const isFunction = (value) => typeof value === 'function';
export const isObject = (value) => value !== null && typeof value === 'object';

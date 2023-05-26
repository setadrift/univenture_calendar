import { noop } from './noop';
/**
 * Adds an event listener to an element.
 * @returns A callback to remove the event listener from the element.
 *
 * @param target
 * @param type
 * @param listener
 * @param options
 */
export function addListener(target, type, listener, options) {
    if (!target)
        return noop;
    target.addEventListener(type, listener, options);
    return () => target.removeEventListener(type, listener, options);
}

import { isHTMLInputElement, isHTMLSelectElement, isHTMLTextAreaElement } from './instances';
/**
 * Checks if an element is a form field element
 * @param element
 */
// prettier-ignore
export const isFormField = (element) => isHTMLInputElement(element) || isHTMLSelectElement(element) || isHTMLTextAreaElement(element);


import { $template } from './module/$template_main_1.js';

export { $template };

export function findCommandTag(content) {
    let res = $template.TagTools.findCommandTag(content);
    return res;
};

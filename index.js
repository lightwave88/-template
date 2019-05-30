
import { $template } from './$template_2_es6.js';

export { $template };

export function findCommandTag(content) {
    let res = $template.TagTools.findCommandTag(content);
    return res;
};

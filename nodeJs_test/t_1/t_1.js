const $util = require('util');

const $template = require('_template1');

const $fs = $template.module.file;
const $path = $template.module.path;

let pagePath = $path.join(__dirname, './html/h_1.html');

let context = $fs.readFileSync(pagePath);

let fn = $template(context);

debugger;
fn();





const $util = require('util');

const $template = require('_template1');

const $fs = $template.module.file;
const $path = $template.module.path;

let pagePath = $path.join(__dirname, './html/h_2.html');

let context = $fs.readFileSync(pagePath);

debugger;

console.dir($template);

console.time('a');


let fn = $template(context);

console.dir(fn);

let p = fn();

p.then((d) => {
    console.timeEnd('a');
    console.dir(d);
    debugger;
}).catch((err) => {
    console.timeEnd('a');
    console.dir(err);
    debugger;
});





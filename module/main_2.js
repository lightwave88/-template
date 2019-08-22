// debugger;

import { innerHTML } from './innerHTML/main_2.js';

import { TagTools } from './template/tagTools_3.js';

// 把文本解析成藥的樣板
import { AnalyzeEngine } from './template/analyzeEngine_1.js';

// 應用涵式模組
// import { FuntionModels } from './template/functions_1.js';

// output 模組
// import { OutputModuleClass } from './template/output_1.js';

// import { TemplateFilter } from './template/filter_1.js';

//=============================================================================
/* 
options: {
    async: false
}
*/
const $template = {
    info: {},
    output: {},
    filter: {},
    transform: {},
    test: {},
    setting: {},
};
//--------------------------------------------------------------------------
// $template 類別函式

(function () {

    // API
    //
    // factory.setUrl()
    // factory.render(data, path)
    // opions: {async: 採用非同步模式}
    $template.getFactory = function (context, options) {
        let factory = new AnalyzeEngine(context, options);
    };

    // 增加模板內的功能
    $template.addFunction = function (name, fun, moduleName) {

    };

    // API
    // 針對 dom.innerHTML 對 textNode 的解析會出錯
    $template.innerHTML = function (dom, includeRoot) {
        return innerHTML(dom, includeRoot);
    };

})();


(function () {
    const $out = $template.output;
    const $filter = $template.filter;
    const $transform = $template.transform;

    $out.add = function (name, fun, moduleName) {

    };

    $filter.add = function (name, fun, moduleName) {

    };

    // 把規格轉成 (% %)
    $transform.toStandMode = function (content) {

    };

    $transform.toEditMode = function (content) {

    };

})();



(function(){
    // test
    const $test = $template.test;

    // 把內文解析為節點
    $template.getHTMLNodeList = function (content, options) {
        let nodeList = TagTools.findCommandTag(content, options);
        return nodeList;
    };
    
    // test
    // 取得內文解析後的模版函式內容
    $template.getFncontext = function (content, options) {
        let nodeList = TagTools.findCommandTag(content, options);
        let fnCommand = '';

        // 困難地方
        nodeList.forEach(function (node) {
            // this.fnCommand += node.printCommand(this.SCRIPTS);
            fnCommand += node.printCommand();
        });
        return fnCommand;
    };
})();

//==========================================================================


export { $template };

// debugger;

import { SystemInfo } from './template/systemInfo_1.js';

import { TagTools } from './template/tagTools_3.js';

// 把文本解析成藥的樣板
import { RenderFactory } from './template/renderFactory_2.js';

// 應用涵式模組
const FunctionModule = require('./template/functions_2.js');

// output 模組
const OutputModule = require('./template/output_2.js');

const Filter = require('./template/filter_2.js');

// 轉換模組
// const Transform = require('./template/transform_1.js');

//=============================================================================

// 取得 render function
// renderFunction.setModuleName()
// renderFunction.setPath()
// renderFunction.setOptions()
// renderFunction.setData()
const $template1 = function (content, options) {
    // debugger;

    if ($template1.systemInfo == null) {
        // 第一次執行會偵測系統相關資訊
        $template1.systemInfo = SystemInfo.getInfo();
    }
    // debugger;

    // return;

    let fn = RenderFactory.getRenderFunction($template1.systemInfo, content, options);
    return fn;
};

export { $template1 };

//--------------------------------------------------------------------------
// $template 類別函式

(function () {
    const $t = $template1;

    $t.file = $t.systemInfo.file;

    // 功能模組
    $t.fun = FunctionModule;

    // 輸出模組
    $t.output = OutputModule;

    // 文章過濾模組
    $t.filter = Filter;

    // 命令轉換模組
    $t.transform = Transform;

    $t.test;

    $t.setting;

})();


(function () {
    const $t = $template1;

    $t.setIncludeRootPath = function () {

    };

    $t.getIncludeRootPath = function () {

    };

})();


(function () {

    return;

    // test
    const $test = $template1.test || {};

    // 把內文解析為節點
    $template1.getHTMLNodeList = function (content, options) {
        let nodeList = TagTools.findCommandTag(content, options);
        return nodeList;
    };

    // test
    // 取得內文解析後的模版函式內容
    $template1.getFncontext = function (content, options) {
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




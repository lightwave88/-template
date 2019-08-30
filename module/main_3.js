// debugger;

import { SystemFactory } from './template/systemInfo_1.js';

import { TagTools } from './template/tagTools_3.js';

// 把文本解析成藥的樣板
import { RenderFactory } from './template/renderFactory_2.js';

// 應用涵式模組
import { FunctionModule } from './template/functions_2.js';

// output 模組
import { OutputModule } from './template/output_2.js';

import { Filter } from './template/filter_2.js';

import { Transform } from './template/transform_1.js';

//=============================================================================
/*
options: {
    async: false
}
*/


// 取得 render function
// renderFunction.setModuleName()
// renderFunction.setPath()
// renderFunction.setOptions()
// renderFunction.setData()
const $template = function (content, options) {
    debugger;

    if($template.systemInfo == null){
        
        $template.systemInfo = SystemFactory.getSystemInfo();
        $template.file = $template.systemInfo.FileSystem;

    }
    debugger;

    return;

    let fn = RenderFactory.getRenderFunction(content, options);
    return fn;
};

//--------------------------------------------------------------------------
// $template 類別函式

(function () {
    const $t = $template;

    $t.systemInfo;

    $t.file;

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
    // test
    const $test = $template.test || {};

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

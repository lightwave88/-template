// debugger;

import { innerHTML } from './innerHTML/main_1.js';

import { TagTools } from './template/tagTools_3.js';

// 把文本解析成藥的樣板
import { AnalyzeContent } from './template/analyzeContent_1.js';

// 應用涵式模組
import { M } from './template/functions_1.js';

// output 模組
import { OutputModuleClass } from './template/output_1.js';

import { TemplateFilter } from './template/filter_1.js';

const $out_addOnModules = OutputModuleClass.addOn_modules;

/* 
options: {
    async: false
}
*/
const $template = (function () {

    const $template = function (content, options) {
        debugger;

        let al = new AnalyzeContent(content, options);

        let res = al.getFn();

        return res;
    };
    //--------------------------------------------------------------------------
    // $template 類別函式

    (function () {

        // API
        // 把規格轉成 (% %)
        $template.toStandMode = function (content, mode) {

        };

        // API
        // 把規格轉成 <% %>
        $template.toStandMode1 = function (content, mode) {

        };

        // API
        // 轉成編輯模式
        // mode: [_, javascript]
        // 轉換過程比較複雜，必須忽略 attr
        $template.toEditMode = function (content, mode) {

        };

        // API
        // 針對 innerHTML 對 textNode 的解析會出錯
        $template.innerHTML = function (dom, includeRoot) {
            return innerHTML(dom, includeRoot);
        };

        // test
        // 把內文拆成節點
        $template.analyzeHTML = function (content, options) {
            return TagTools.findCommandTag(content, options);
        };

        // test
        // 取得內文解析後的模版函式內容
        $template.getFncontext = function (content, options) {
            let al = new AnalyzeContent(content, options);
            return al.getFnCommand();
        };

        // 模板相關設定值
        // $template.settings = {};

        // 可擴充 output 功能
        $template.addOutput = function (key, fn) {
            if (typeof (fn) != 'function') {
                throw new TypeError(`args[1] must be function`);
            }
            $out_addOnModules[key] = fn;
        };

        // 擴充一般功能
        $template.addFun = function (key, fn) {
            M[key] = fn;
        };

        // 文字篩選器
        $template.addFilter = function (key, fn) {
            const filterMap = TemplateFilter.filterMap;
            filterMap.set(key, fn);
        };

    })();
    //==========================================================================

    return $template;
})();

export { $template };



// 系統資訊
class SystemInfo {

    static getInfo() {
        // debugger;

        if (SystemInfo.instance == null) {
            SystemInfo.instance = new SystemInfo();
        }
        let info = SystemInfo.instance.getInfo();

        return info;
    }
    //---------------------------------
    constructor() {
        // debugger;

        this.info = {
            // 確定系統環境
            system: null,

            // include path
            // node.js 是以專案根目錄為主
            // browser 以當前網站網址
            includeRootPath: null,
            fileSystemFileSystem: null,
            pathSystem: null,
        };

        this._checkSystem();

        this._getIncludePath();

        this._getFileSystem();
    }
    //---------------------------------
    getInfo() {
        return this.info;
    }
    //---------------------------------
    // 確定系統
    _checkSystem() {
        // debugger;
        if (window != null && document != null) {
            this.info.system = 'browser';
        } else if (module != null && module.exports != null) {
            this.info.system = 'nodejs';
        } else {
            throw new Error('unknow system');
        }
    }
    //---------------------------------
    _getIncludePath() {
        // debugger;
        const sysInfo = this.info;

        if (/nodejs/.test(sysInfo.system)) {
            // node.js 是以專案根目錄為主
            sysInfo.includeRootPath = process.cwd();
        } else {
            let path = location.href;
            path = path.replace(/[?][\s\S]*$|#[\s\S]*$/, "");
            sysInfo.includeRootPath = path;
        }

    }
    //---------------------------------
    _getFileSystem() {
        // debugger;

        let fileSys;

        if (/nodejs/.test(sysInfo.system)) {
            fileSys = new NodeJsFileSystem(this.info);
        } else {
            fileSys = new BrowserFileSystem(this.info);
        }
        this.info.fileSystem = fileSys;
    }
    //---------------------------------
    _getPathSystem() {
        // debugger;

        this.info.pathSystem = new Path(this.info);
    }
}

SystemInfo.instance;

export { SystemInfo };

///////////////////////////////////////////////////////////////////////////////
// include()，所需
class FileSystem {
    constructor(info) {
        this.info = info;
    }

    loadFile(path) {
        throw new Error("need override");
    }

    loadFileSync(path) {
        throw new Error("need override");
    }
}
//----------------------------
class NodeJsFileSystem extends FileSystem {

    loadFile(path) {
        const fs = require("fs");

        return new Promise(function (res, rej) {
            fs.readFile(path, 'utf8', function (er, data) {
                if (er != null) {
                    rej(er);
                } else {
                    res(data);
                }
            });
        });
    }

    loadFileSync(path) {
        const fs = require("fs");
        let res = fs.readFileSync(path, 'utf8');

        return res;
    }
}
//----------------------------
class BrowserFileSystem extends FileSystem {

    loadFile(path) {
        return this._ajax({
            url: path,
            async: true,
        });
    }

    loadFileSync(path) {
        return this._ajax({
            url: path,
            async: false,
        });
    }

    /*
    data={
        data:{},
        dataType:"xml/'',
        type:"get/post",
        url:"",
        async:"true/false"
    }
    data:{username:123,password:456}
    */

    _ajax(data) {
        // debugger;

        let res;

        //第一
        let ajax = null;
        if (window.XMLHttpRequest) {
            ajax = new XMLHttpRequest();
        } else {
            ajax = new ActiveXObject();
        }
        //-----------------------
        //第二
        let type = data.type == 'get' ? 'get' : 'post';
        let async = data.async == false ? false : true;
        data.data = Object.assign({}, data.data);

        let url = data.url;
        let currentTime = (new Date()).getTime();
        let argList = [];

        if (Object.keys(data.data).length > 0) {
            for (let k in data.data) {
                argList.push(`${k}=${data.data[k]}`);
            }
        }
        //-----------------------
        //第三
        if (type == 'get') {

            argList.push(`_time=${currentTime}`);
            let argText = argList.join("&");

            url += "?" + argText;

            ajax.open(data.type, url, async);
            ajax.send(null);

        } else {
            let argText = null;

            if (argList.length > 0) {
                argText = argList.join("&");
            }

            ajax.open(data.type, url, async);
            ajax.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            ajax.send(argText);
        }
        //-----------------------
        //第四
        if (async) {

            return new Promise(function (resolve, reject) {
                ajax.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (this.status == 200) {
                            // debugger;

                            if (/^xml$/.test(data.dataType)) {
                                res = ajax.responseXML;
                            } else {
                                res = ajax.responseText;
                            }

                            resolve(res);
                        } else {
                            reject();
                        }
                    }
                }
            });
        } else {
            if (/^xml$/.test(data.dataType)) {
                res = ajax.responseXML;
            } else {
                res = ajax.responseText;
            }
            return res;
        }
    }

}
///////////////////////////////////////////////////////////////////////////////
// 對瀏覽器，實作 Path
class Path {
    constructor(info) {
        this.reg_1 = /^(?:[/][\s\S]*|[.]\/[^/]|\.\.[^/])$/;
        this.info = info;
    }

    checkPath(_path) {
        let path;

        let isRelative = false;


        if (/nodejs/.test(this.info.system)) {

        } else {

        }

        return path;
    }
}

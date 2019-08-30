



//
class SystemFactory {

    static getSystemInfo() {
        debugger;
        
        if (SystemFactory.instance == null) {
            SystemFactory.instance = new SystemFactory();
        }
        let systemFactory = SystemFactory.instance;
        let info = systemFactory.getSystemInfo();

        return info;
    }

    constructor() {
        debugger;

        this.systemInfo = {
            system: null,
            defaultIncludePath: null,
            FileSystem: null,
            PathSystem: null,
        };

        this._checkSystem();

        this._getIncludePath();

        this._getFileSystem();

        this._getPathSystem();
    }

    getSystemInfo() {
        return this.systemInfo;
    }

    // 確定系統
    _checkSystem() {
        debugger;
        if (window != null && document != null) {
            this.systemInfo.system = 'browser';
        } else if (module != null && module.exports != null) {
            this.systemInfo.system = 'nodejs';
        } else {
            throw new Error('unknow system');
        }
    }

    _getIncludePath() {
        debugger;
        const sysInfo = this.systemInfo;

        if (/nodejs/.test(sysInfo.system)) {
            sysInfo.defaultIncludePath = process.cwd();
        } else {
            let path = location.href;
            path = path.replace(/[?][\s\S]*$|#[\s\S]*$/, "");
            sysInfo.defaultIncludePath = path;
        }

    }

    _getFileSystem() {
        debugger;

        const sysInfo = this.systemInfo;

        if (/nodejs/.test(sysInfo.system)) {
            sysInfo.FileSystem = new NodeJsFileSystem();
        } else {
            sysInfo.FileSystem = new BrowserFileSystem();
        }
    }

    _getPathSystem() {
        debugger;

        const sysInfo = this.systemInfo;

        if (/nodejs/.test(sysInfo.system)) {
            sysInfo.PathSystem = new NodeJsFileSystem();
        } else {
            sysInfo.PathSystem = new BrowserFileSystem();
        }
    }
}

SystemFactory.instance;

export { SystemFactory };
///////////////////////////////////////////////////////////////////////////////
// include()，所需
class FileSystem {
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



    setUrl() {

    }

    getUrl() {

    }

}


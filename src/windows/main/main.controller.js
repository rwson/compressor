const { dialog } = require("electron").remote,
    path = require("path"),
    os = require("os"),
    fs = require("fs"),
    NotificationPolyfill = require("electron-notification-polyfill"),
    imagemin = require("imagemin"),
    imageminJpegtran = require("imagemin-jpegtran"),
    imageminPngquant = require("imagemin-pngquant"),
    menu = require("../../common/menu"),
    doc = document,
    container = doc.querySelector("#container"),
    tip = container.querySelector(".tip-container"),
    set = doc.querySelector("#set"),
    settings = doc.querySelector("#settings"),
    loading = doc.querySelector("#loading"),
    position = settings.querySelector("#position"),
    change = settings.querySelector("#change-postion"),
    confirm = settings.querySelector("#confirm"),
    cancel = settings.querySelector("#cancel"),
    numberInput = [].slice.call(settings.querySelectorAll(".input-text")),
    prefixInput = settings.querySelector("[name='end-prefix']");

menu.create();

let distPath = path.join(os.homedir(), "Desktop"),
    level, notification, timeout, prefix;

if (getItem("distPath")) {
    distPath = getItem("distPath");
    position.innerHTML = distPath;
}
position.innerHTML = distPath;

if (getItem("prefix")) {
    prefix = getItem("prefix");
    if (prefix === "undefined") {
        prefix = "";
    }
}

if (getItem("level")) {
    level = getItem("level");
}

const Notification = (process.platform === "win32" && parseFloat(os.release()) < 10) ?
    NotificationPolyfill : window.Notification;

addEvent(container, "click", function(e) {
    const { target } = e;
    let { tagName, classList } = target;
    tagName = tagName.toLowerCase();

    if (classList.contains("set")) {
        settings.style.display = "block";
        return;
    }

    if (tagName === "svg" || tagName === "path" || classList.contains("tip-text")) {
        level = localStorage.getItem("level");
        if (level === null) {
            level = "65-80";
        }
        dialog.showOpenDialog({
            type: "question",
            properties: ["openFile", "openDirectory", "multiSelections"],
            message: "请选择您要压缩的图片文件或图片目录"
        }, function(res) {
            if (res && res.length) {
                res = res.map(function(item) {
                    return toImgPath(item);
                });

                console.log(level);

                compress(res, level);
            }
        });
    }
});

addEvent(container, "dragover", function(e) {
    return false;
});

addEvent(container, "dragleave", function(e) {
    return false;
});

addEvent(container, "drop", function(e) {
    e.preventDefault();
    var files = [].slice.call(e.dataTransfer.files);
    files = files.map(function(file) {
        return toImgPath(file.path);
    });
    if (files.length) {
        compress(files, level);
    }
});

addEvent(change, "click", function() {
    dialog.showOpenDialog({
        type: "question",
        properties: ["openDirectory"],
        message: "请选择目标路径"
    }, function(res) {
        if (res.length) {
            distPath = res[0];
            position.innerHTML = distPath;
        }
    });
});

addEvent(confirm, "click", function(e) {
    prefix = prefixInput.value.trim();
    level = numberInput[0].value.trim() + "-" + numberInput[1].value.trim();
    var items = [{
        key: "level",
        value: level
    }, {
        key: "distPath",
        value: distPath
    }, {
        key: "prefix",
        value: prefix
    }];
    setItems(items);
    settings.style.display = "none";
});

addEvent(cancel, "click", function() {
    settings.style.display = "none";
});

numberInput.forEach(function(el) {
    const { max, min, role } = el.dataset;
    el.onkeyup = function() {
        let { value } = el;
        value = Number(value.trim());
        if (value.length && !/^\d+$/.test(value)) {
            el.value = 0;
        } else if (value.length) {
            if (value > max || value < min) {
                switch (role) {
                    case "max":
                        el.value = max;
                        break;
                    case "min":
                        el.value = min;
                        break;
                    default:
                        break;
                }
            }
        }
    };
});

function compress(files, quality) {
    loading.style.display = "flex";
    imagemin(files, distPath, {
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: quality,
                floyd: 1,
                speed: 5,
                posterize: 2
            })
        ]
    }).then((files) => {
        notification = new Notification("compress", {
            body: "压缩成功",
            icon: path.join(__dirname, "../../assets/imags/notifaction.png")
        });
        loading.style.display = "none";
    }).catch((e) => {
        console.log(e);
        notification = new Notification("compress", {
            body: "压缩失败, 请检查您的图片是否正确或者调整压缩质量",
            icon: path.join(__dirname, "../../assets/imags/notifaction.png")
        });
        loading.style.display = "none";
    });
}

function addEvent(el, name, handler) {
    el["on" + name] = handler;
}

function getItems(names) {
    var res = {};
    names.forEach(function(name) {
        res[name] = getItem(name);
    });
    return res;
}

function setItems(items) {
    items.forEach(function(item) {
        if (item.key && item.value) {
            localStorage.setItem(item.key, typeof item.value === "string" ? item.value : ("" + item.value));
        }
    });
}

function getItem(key) {
    var res;
    res = localStorage.getItem(key);
    if (res === null || res === "undefined") {
        return undefined;
    }
    return res;
}

function toImgPath(path) {
    if (!/\.jpg|\.png|\.jpeg$/.test(path)) {
        path = path + "/*.{jpg,png}";
    }
    return path;
}
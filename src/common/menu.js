const { Menu, dialog } = require("electron").remote;

module.exports = {
    create: () => {
        const appMenu = Menu.buildFromTemplate([{
            label: "compressor",
            submenu: [{
                label: "设置",
                accelerator: "CmdOrCtrl+K",
                click: function() {
                    alert("fuck 王雷");
                }
            }, {
                label: "退出",
                accelerator: "CmdOrCtrl+Q",
                selector: "terminate:"
            }]
        }]);

        Menu.setApplicationMenu(appMenu);
    }
};

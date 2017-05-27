const { app, ipc, BrowserWindow } = require("electron");

let mainWindow = null;

app.on("window-all-closed", () => {
    if (process.platform != "darwin") {
        app.quit();
    }
});

app.on("ready", function() {
    mainWindow = new BrowserWindow({
        width: 850,
        height: 600,
        fullscreen: false
    });

    mainWindow.loadURL("file://" + __dirname + "/windows/main/main.html");

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", function() { mainWindow = null });
});

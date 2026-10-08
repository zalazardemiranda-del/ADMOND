const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1366,
        height: 850,
        minWidth: 1024,
        minHeight: 700,
        title: "ADMOND - Rodipack Gestión",
        icon: path.join(__dirname, 'Logo interno.png'),
        backgroundColor: '#FFFFFF',
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false
        }
    });

    win.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

import { app, BrowserWindow, dialog, Menu, MenuItem, screen } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {ChildProcess, ChildProcessWithoutNullStreams, exec, spawn} from 'node:child_process';
import log from 'electron-log/main';
import {SpawnOptions} from "child_process";

const { ipcMain } = require('electron');
const isDev = require('electron-is-dev');

log.initialize();

let win: BrowserWindow | null = null;
let childProcessIsSpawned: boolean=false; // Declare childProcess variable outside the function scope
let windowCreated = false; // Flag to track if window has been created

const args = process.argv.slice(1),
    serve = args.some(val => val === '--serve');

function createWindow(): BrowserWindow {
    if (windowCreated) {
        return win!;
    }

    windowCreated = true;

    const size = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        x: 0,
        y: 0,
        width: size.width,
        height: size.height,
        webPreferences: {
            nodeIntegration: true,
            allowRunningInsecureContent: (serve),
            contextIsolation: false,
            webSecurity: false,
        },
        title: 'PDF Splitter',
    });
    const defaultMenu = Menu.getApplicationMenu();

    // Find the 'File' menu by label
    const fileMenu = defaultMenu?.items.find((item) => item.label === 'File');

    // Append 'Open' menu item to the 'File' menu
    if (fileMenu) {
        fileMenu.submenu?.insert(0,
            new MenuItem({
                label: 'Open',
                accelerator: 'CmdOrCtrl+O',
                click: () => {
                    openFileDialog();
                },
            })
        );
    }
    Menu.setApplicationMenu(defaultMenu);

    if (!serve) {
        // Path when running electron executable
        let pathIndex = './index.html';

        if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
            // Path when running electron in local folder
            pathIndex = '../dist/index.html';
        }

        const url = new URL(path.join('file:', __dirname, pathIndex));
        win.loadURL(url.href);
    } else {
        win.loadURL('http://localhost:4200');
    }

    /*if (!isDev && !childProcessIsSpawned) {
        const exePath = path.join(__dirname, '..', '..', 'rest_api.exe');
        let options : SpawnOptions = {
            detached: false,
            shell: false,
            windowsHide: true };
        childProcess = spawn(exePath, [], options); // Detached mode, no
        childProcessIsSpawned = true;
        childProcess.unref(); // Allow the parent process to exit independently of the child process
        log.info(`rest_api.exe spawned with options ${JSON.stringify(options)}`);
    }*/
    if (!isDev && !childProcessIsSpawned) {
        // Define the PowerShell command
        const exePath = path.join(__dirname, '..', '..', 'rest_api.exe');
        const powershellCommand = `Start-Process -FilePath "${exePath}" -NoNewWindow
`;
        // Execute the PowerShell command
        exec(`powershell.exe -Command "${powershellCommand}"`, (error, stdout, stderr) => {
            if (error) {
                log.error(`Error executing PowerShell command: ${error.message}`);
                return;
            }
            log.log(`PowerShell command stdout: ${stdout}`);
            log.error(`PowerShell command stderr: ${stderr}`);
        });
    }

    win.on('closed', () => {
        win = null;
        windowCreated = false; // Reset windowCreated flag
        // Kill all processes associated with rest_api.exe
        exec('taskkill /f /im rest_api.exe', (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing taskkill: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`taskkill stderr: ${stderr}`);
                return;
            }
            console.log(`taskkill stdout: ${stdout}`);
        });
    });

    return win;
}

function openFileDialog() {
    const files = dialog.showOpenDialogSync(win!, {
        properties: ['openFile'],
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });
    if (files && files.length > 0) {
        win?.webContents.send('pdf-path', files[0]);
    }
}

try {
    ipcMain.on('open-file-dialog', (event) => {
        dialog.showOpenDialog({
            properties: ['openDirectory']
        }).then(result => {
            if (!result.canceled) {
                event.sender.send('selected-directory', result.filePaths[0]);
            }
        }).catch(err => {
            log.info(err);
            console.log(err);
        });
    });

    app.on('ready', () => setTimeout(createWindow, 400));

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // Catch Error
    // throw e;
}

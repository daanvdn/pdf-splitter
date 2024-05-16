import {app, BrowserWindow, dialog, Menu, MenuItem, screen} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import {exec} from 'node:child_process';
import log from 'electron-log/main';

const {ipcMain} = require('electron');
const isDev = require('electron-is-dev');
const Store = require('electron-store');


log.initialize();
const store = new Store();

let win: BrowserWindow | null = null;
let childProcessIsSpawned: boolean = false; // Declare childProcess variable outside the function scope
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
    const defaultMenu = Menu.getApplicationMenu() as Electron.Menu;


    // Find the 'File' menu by label
    const fileMenu = defaultMenu?.items.find((item) => item.label === 'File') as Electron.MenuItem;


    // Append 'Open' menu item to the 'File' menu
    fileMenu.submenu?.insert(0,
        new MenuItem({
            label: 'Open',
            accelerator: 'CmdOrCtrl+O',
            click: () => {
                openFileDialog();
            },
        })
    );


    const outputMenu = new MenuItem({
        label: 'Output',
        submenu: [
            {
                label: 'Open',
                accelerator: 'CmdOrCtrl+D',
                click: () => {
                    openOutputDirDialog();
                },
            }
        ]
    })
    defaultMenu.insert(1, outputMenu);



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
    }
    else {
        win.loadURL('http://localhost:4200');
    }

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

function openFileDialog(): void {
    const files = dialog.showOpenDialogSync(win!, {
        properties: ['openFile'],
        filters: [{name: 'PDF Files', extensions: ['pdf']}],
    });
    if (files && files.length > 0) {
        let file = files[0];
        addFileToRecent(file);
        win?.webContents.send('pdf-path', file);
    }
}

function openOutputDirDialog(): void {
    const files = dialog.showOpenDialogSync(win!, {
        properties: ['openDirectory'],
    });
    if (files && files.length == 1) {
        let file = files[0];
        addOutputDirToLast(file);
        win?.webContents.send('output-path', file);
    }
}

// Update the file menu with the recent files
function updateFileMenu() {
    const recentFiles: string[] = getRecentFiles();
    const defaultMenu = Menu.getApplicationMenu();
    const fileMenu = defaultMenu?.items.find((item) => item.label === 'File');

    if (fileMenu && recentFiles.length > 0) {
        // Remove all existing recent file menu items

        fileMenu.submenu?.append(new MenuItem({type: 'separator'}));

        // Add new menu items for each recent file
        recentFiles.forEach((file, index) => {
            fileMenu.submenu?.append(
                new MenuItem({
                    label: `Recent - ${file}`,
                    click: () => {
                        win?.webContents.send('pdf-path', file);
                    },
                })
            );
        });

        Menu.setApplicationMenu(defaultMenu);
    }
}

function updateOutputMenu() {
    const lastOutputDir: string | null = getLastOutputDir();
    const defaultMenu = Menu.getApplicationMenu();
    const outputMenu = defaultMenu?.items.find((item) => item.label === 'Output');

    if (outputMenu && lastOutputDir) {
        // Remove all existing recent file menu items

        outputMenu.submenu?.append(new MenuItem({type: 'separator'}));
        outputMenu.submenu?.append(
            new MenuItem({
                label: `Last - ${lastOutputDir}`,
                click: () => {
                    win?.webContents.send('output-path', lastOutputDir);
                },
            })

        );

        Menu.setApplicationMenu(defaultMenu);
    }
}


// Add a file to the recently opened files list
function addFileToRecent(filePath: string) {
    let recentFiles = store.get('recentFiles', []);
    if (!recentFiles.includes(filePath)) {
        recentFiles.push(filePath);
        // Only keep the last 10 items
        if (recentFiles.length > 10) {
            recentFiles.shift();
        }
        store.set('recentFiles', recentFiles);
    }
}

function addOutputDirToLast(filePath: string) {
    store.set('lastOutputDirectory', filePath);
}

// Get the list of recently opened files
function getRecentFiles(): string[] {
    return store.get('recentFiles', []);
}

function getLastOutputDir(): string | null {
    return store.get('lastOutputDirectory', null);
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

    app.on('ready', () => setTimeout(() => {
        createWindow();
        updateFileMenu();
        updateOutputMenu();
    }, 400));

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

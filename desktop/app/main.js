const { app, BrowserWindow, Menu, dialog } = require('electron');
const log = require('electron-log');
const { autoUpdater } = require('electron-updater');
const shell = require('electron').shell;

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win, aboutModal;

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', function () {
  createMenu();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createMenu();
    createWindow();
  }
})

function createWindow () {
  const electron = require('electron');
  let screenElectron = electron.screen;
  let mainScreen = screenElectron.getPrimaryDisplay();
  let dimensions = mainScreen.size;
  log.info(dimensions.width + ' x ' + dimensions.height);

  let appWinWidth = parseInt(dimensions.width * 0.85, 10);
  let appWinHeight = parseInt(dimensions.height * 0.9, 10);

  win = new BrowserWindow({ width: appWinWidth, height: appWinHeight });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
    aboutModal = null;
  });

  // open external link in browser window
  win.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  });

  win.webContents.on('new-window', (e, url) => {
    if (url !== win.webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });

  win.loadURL(`file://${__dirname}/index.html`);

  addContextMenu(win);
  return win;
}

function createMenu () {
  let template = []
  let keyboardShortcuts = {
    'win': {
      'quit': 'Alt+Q',
      'debug': 'F12'
    },
    'mac': {
      'quit': 'Command+Q'
    }
  };

  let platform = process.platform;
  if (platform === 'win32') platform = 'win';

  const appName = app.getName();
  template.push({
    label: platform === 'win' ? 'File' : appName,
    submenu: [
      {
        label: 'About ' + appName,
        click () {
          openAboutDialog();
        }
      },
      {
        label: 'Reload',
        click () {
          win.loadURL(`file://${__dirname}/index.html`);
          // var remote = require('remote');
          // remote.getCurrentWindow().reload();
        }
      },
      {
        label: 'Quit',
        accelerator: keyboardShortcuts[platform] ? keyboardShortcuts[platform]['quit'] : '',
        click () { app.quit(); }
      }
    ]
  });
  template.push(
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
        { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
        { type: 'separator' },
        { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
        { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
        { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' }
      ]
    }
  );
  template.push({
    label: 'Help',
    submenu: [
      {
        label: 'Check for update',
        click () {
          openUpdateDialog();
        }
      },
      {
        label: 'Debug console',
        accelerator: keyboardShortcuts[platform] ? keyboardShortcuts[platform]['debug'] : '',
        click () { win.webContents.openDevTools(); }
      },
      {
        type: 'separator'
      },
      {
        label: 'Support',
        click () { shell.openExternal('https://nexuspad.com'); }
      }
    ]
  });

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function addContextMenu (win) {
  const selectionMenu = Menu.buildFromTemplate([
    {role: 'copy'},
    {type: 'separator'},
    {role: 'selectall'},
  ])

  const inputMenu = Menu.buildFromTemplate([
    {role: 'undo'},
    {role: 'redo'},
    {type: 'separator'},
    {role: 'cut'},
    {role: 'copy'},
    {role: 'paste'},
    {type: 'separator'},
    {role: 'selectall'},
  ])

  win.webContents.on('context-menu', (e, props) => {
    const { selectionText, isEditable } = props;
    if (isEditable) {
      inputMenu.popup(win);
    } else if (selectionText && selectionText.trim() !== '') {
      selectionMenu.popup(win);
    }
  })
}

function openAboutDialog () {
  aboutModal = new BrowserWindow({ parent:win, show:false, width:400, height:300 });
  aboutModal.setMenu(null);
  aboutModal.loadURL(`file://${__dirname}/about.html`);

  aboutModal.once('ready-to-show', () => {
    aboutModal.show();
    autoUpdater.checkForUpdatesAndNotify();
  });
}

function openUpdateDialog () {
  aboutModal = new BrowserWindow({ parent:win, show:false, width:400, height:300 });
  aboutModal.setMenu(null);
  aboutModal.loadURL(`file://${__dirname}/checkforupdate.html#${app.getVersion()}`);

  aboutModal.once('ready-to-show', () => {
    aboutModal.show();
    autoUpdater.checkForUpdatesAndNotify();
  });
}

function sendStatusToWindow (text) {
  log.info(text);
  if (aboutModal) {
    aboutModal.webContents.send('message', text);
  }
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available. Prepare to download.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('You have the latest version.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = parseInt(progressObj.percent, 10) + '% downloaded';
  sendStatusToWindow(logMessage);
})
autoUpdater.on('update-downloaded', () => {
  sendStatusToWindow('Update downloaded.');
  const dialogOptions = {type: 'info', buttons: ['OK', 'Cancel'], message: 'Restart to update?'};
  dialog.showMessageBox(dialogOptions, i => {
    if (i === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

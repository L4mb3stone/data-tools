// 导入模块，不能使用ES6的语法
const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  shell,
  globalShortcut,
  Notification,
  dialog,
  powerSaveBlocker,
} = require("electron");
const path = require("path");
const WinState = require("electron-win-state").default;
const fs = require("fs");
const { execFile } = require("child_process");

// 检查是否已经有一个实例运行
const isSingleInstance = app.requestSingleInstanceLock();
var cmd = require('node-cmd');

if (!isSingleInstance) {
  // 如果已经有一个实例在运行，关闭当前实例并退出
  app.quit();
}

// 禁用当前应用程序的GPU加速
app.disableHardwareAcceleration()

let isDev = false;
async function checkIsDev() {
  // const module = await import("electron-is-dev");
  // isDev = module.default;
  isDev = !app.isPackaged;
  // 全局捕获一下
  try {
    console.log(isDev);
    work();
  } catch (error) {
    console.log(error);
    dialog.showMessageBox({
      type: "error", // 对话框类型
      title: "未知错误", // 标题栏文本
      message: "未知错误，请联系开发者", // 主消息文本
      detail: error.message, // 详细错误信息
      buttons: ["确定"], // 对话框按钮
    });
  }
}

const work = () => {
  if (process.platform === "win32") {
    app.setAppUserModelId(app.name);
  }
  // 创建一个窗口
  let win = null;
  let globalSettings = []; // 用户全局配置 position:0|voice:1

  // 创建主窗口
  const createWindow = () => { 
    // 开发环境运行路径
    let execFilePath = path.join(
      process.cwd(),
      "/http_service",
      "app.exe"
    );
    // 生产环境运行路径
    if (!isDev) {
      execFilePath = path.join(
        process.cwd(),
        "/resources/http_service",
        "app.exe"
      );
    }
    console.log(execFilePath)
    fs.stat(execFilePath, (err) => {
      if (err) {
        console.log("path error");
      } else {
        console.log("start running back-end");
        child = execFile(execFilePath, (err, stdout, stderr) => {
          console.log("Err:", err);
          console.log("StdOut:", stdout);
          console.log("StdErr:", stderr);
        });
      }
    });
    // 防止打开两个主窗口程序
    if (win != null) {
      return;
    }
    const winState = new WinState({});
    win = new BrowserWindow({
      ...WinState.winOptions,
      icon: "public/icons/icon.png", // 指定图标路径
      frame: false,
      resizable: true,  //是否改变窗口大小
      //center: true,
      //fullscreenable: false,
      //title: 'icbc-tools',
      //vibrancy: 'ultra-dark',
      //transparent: true,   // 透明
      //titleBarStyle: 'hidden', // 隐藏标题栏
      webPreferences: {
        devTools: true,
        webSecurity: false, // 禁用 Web 安全策略
        nodeIntegration: true, // 启用集成
        backgroundThrottling: false, // 取消节流
        // 不安全，不建议使用
        // nodeIntegration: true, // 启用Node.js集成
        // contextIsolation: false, // 取消上下文隔离
        sandbox: false, // 取消沙箱模式
        preload: path.resolve(__dirname, "./preload"), // 在预加载脚本中执行 Electron API
      },
    });
    win.setSize(1100, 720); // 显式设置窗口大小，因为之前的大小被缓存了
    win.center(); // 使窗口居中
    win.setMenu(null); // 去掉窗口
    if (isDev) {
      win.loadURL("http://localhost:5173");
    } else {
      win.loadFile(path.join("dist", "index.html"));
    }
    winState.manage(win); // 配置持久化
    win.on("ready-to-show", () => {
      win.show();
    });
    win.webContents.openDevTools(); // 打开开发者工具
    // 配置所有外部url都使用浏览器打开
    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url); // 使用外部浏览器打开
      return { action: "deny" }; // 阻止 Electron 打开新窗口
    });
  };

  app.whenReady().then(() => {
    createWindow();

    // 阻止应用进入低功耗模式
    const id = powerSaveBlocker.start("prevent-app-suspension");

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
  // 适配mac
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
      child.kill();
      cmd.run(`taskkill /F /im app.exe`)
    }
  });
  // 获取当前操作系统
  ipcMain.handle("get-current-os", async (event) => {
    return process.platform;
  });

  // 移除窗口
  ipcMain.on("remove-window", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.close();
    }
  });

  // 保存文件
  ipcMain.handle("save-file", (event, type, originFilePath) => {
    const pathDir = "backgrounds";

    if (type && originFilePath) {
      // 获取原始文件的扩展名
      const fileExtension = path.extname(originFilePath);
      const fileName = type + fileExtension; // 构造新文件名
      const newFilePath = path.join(process.resourcesPath, pathDir, fileName);
      console.log(newFilePath);
      // 确保backgrounds目录存在
      if (!fs.existsSync(path.join(process.resourcesPath, pathDir))) {
        fs.mkdirSync(path.join(process.resourcesPath, pathDir), {
          recursive: true,
        });
      }

      return new Promise((resolve, reject) => {
        // 读取原始文件内容
        fs.readFile(originFilePath, (readErr, data) => {
          if (readErr) {
            reject(readErr);
          } else {
            // 将内容写入新文件
            fs.writeFile(newFilePath, data, (writeErr) => {
              if (writeErr) {
                reject(writeErr);
              } else {
                // 返回新文件的路径
                let pathName = "/" + pathDir + "/" + fileName;
                resolve(pathName);
              }
            });
          }
        });
      });
    }
    return null;
  });
  // 同步全局配置
  ipcMain.on("sync-else-setting", (event, settings) => {
    // 更新全局的值即可
    globalSettings = settings;
  });

  /* 当ipcMain接收到以下类型为名称的事件时，就会对主进程窗口进行相应的操作 */
  // 窗口最小化
  ipcMain.on('min', () => {
    win.minimize();
  });
  // 窗口最大化
  ipcMain.on('max', () => {
    if (win.isMaximized()) {
      win.restore();
    } else {
      win.maximize();
    }
  });
};

checkIsDev();
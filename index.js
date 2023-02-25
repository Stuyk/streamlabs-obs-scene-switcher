const activeWindows = require('active-windows');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const SockJS = require('sockjs-client');

printInfo('Streamlabs Settings -> Remote Control -> Click the QR Code -> Restart this Client');
printInfo('Attempting Socket Connection to Streamlabs...');

const sock = new SockJS('http://127.0.0.1:59650/api');
const currentDirectory = process.cwd().replace(/\\/g, '/');

let nextConfigRefreshTime = Date.now();
let pendingTransactions = [];
let lastSceneIndex = -1;
let paused = false;
let oldSize = 0;

let config = {
    token: 'slobs settings -> remote control -> click qr code -> show details -> copy api token',
    printWindowNames: false,
    scenes: [
        {
            windowClassName: 'Code.exe',
            windowName: { name: "Project Name", contains: true },
            targetScene: `CodeScene`
        },
        {
            windowClassName: 'GTA5.exe',
            targetScene: `GTAScene`
        }
    ]
};

function readConfiguration() {
    if (!fs.existsSync(path.join(currentDirectory, 'config.json'))) {
        fs.writeFileSync(path.join(currentDirectory, `config.json`), JSON.stringify(config, null, '\t'));
    }

    const configStats = fs.statSync(path.join(currentDirectory, 'config.json'));
    if (oldSize === configStats.size) {
        return;
    }

    oldSize = configStats.size;
    config = JSON.parse(fs.readFileSync(path.join(currentDirectory, `config.json`)).toString());
    printInfo('Configuration has been updated.');
    printInfo(`Current Scene Count: ${config.scenes.length}`);
}

function printInfo(msg) {
    console.log(chalk.blueBright(`[INFO] ${msg}`));
}

async function sendMessage(message) {
    let requestBody = message;
    if (typeof message === 'string') {
        try {
            requestBody = JSON.parse(message);
        } catch (e) {
            alert('Invalid JSON');
            return;
        }
    }

    sock.send(JSON.stringify(requestBody));
}

async function request(resourceId, methodName, ...args) {
    let requestBody = {
        jsonrpc: '2.0',
        id: 2,
        method: methodName,
        params: { resource: resourceId, args }
    };

    await sendMessage(requestBody);
}

sock.onopen = async () => {
    printInfo('Connected to Streamlabs Successfully!');
    readConfiguration();

    if (config.token.includes('slobs')) {
        await new Promise((resolve) => {
            printInfo(`Please Provide an API Token in your 'config.json.'`);
            printInfo(config.token);

            const interval = setInterval(() => {
                readConfiguration();

                if (config.token.includes('slobs')) {
                    return;
                }

                clearInterval(interval);
                resolve();
            }, 2500);
        });
    }

    await request('TcpServerService', 'auth', config.token);
    setInterval(checkCurrentWindow, 200);
};

function checkCurrentWindow() {
    if (paused) {
        return;
    }

    if (!config) {
        return;
    }

    if (Date.now() > nextConfigRefreshTime) {
        nextConfigRefreshTime = Date.now() + 5000;
        readConfiguration();
    }

    const currentWindow = activeWindows.getActiveWindow();
    if (!currentWindow) {
        return;
    }

    if (config.printWindowNames) {
        printInfo(`DEBUG WINDOW NAME: ${currentWindow.windowName}`);
        printInfo(`DEBUG WINDOW CLASS NAME: ${currentWindow.windowClass}`);
    }

    var comparator = (option) => {
        var result = option.windowClassName === currentWindow.windowClass;
        if (result && option.windowName !== undefined) {
            if (typeof option.windowName === "string")
                result = currentWindow.windowName === option.windowName;
            else {
                var windowName = option.windowName.name
                result = option.windowName.contains
                    ? currentWindow.windowName.includes(windowName) 
                    : currentWindow.windowName === windowName
            }
        }
        return result;
    }

    const configIndex = config.scenes.findIndex(comparator);

    if (configIndex <= -1) {
        return;
    }

    const sceneInfo = config.scenes[configIndex];
    if (lastSceneIndex !== -1 && configIndex === lastSceneIndex) {
        return;
    }

    lastSceneIndex = configIndex;
    pendingTransactions.push({ type: 'sceneRequest', sceneName: sceneInfo.targetScene });
    sock.send(
        JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getScenes',
            params: {
                resource: 'ScenesService'
            }
        })
    );
}

sock.onmessage = (e) => {
    if (pendingTransactions.length <= 0) {
        return;
    }

    const transactionType = pendingTransactions.shift();
    const response = JSON.parse(e.data);

    if (transactionType.type !== 'sceneRequest') {
        return;
    }

    if (response.result[0].name === undefined) {
        printInfo(`Was Unable to Parse a Result`);
        return;
    }

    const foundScene = response.result.find((x) => x.name === transactionType.sceneName);
    if (foundScene === undefined) {
        return;
    }

    printInfo(`Transition to Scene: ${transactionType.sceneName}`);
    sock.send(
        JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'makeSceneActive',
            params: {
                resource: 'ScenesService',
                args: [foundScene.id]
            }
        })
    );
};

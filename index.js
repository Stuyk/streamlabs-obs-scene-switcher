console.log('Starting Scene Switcher');

const activeWin = require('active-win');
const fs = require('fs');
const SockJS = require('sockjs-client');
const binds = JSON.parse(fs.readFileSync(`${__dirname}/config.json`));
const sock = new SockJS('http://127.0.0.1:59650/api');
const pendingTransactions = [];

var currWindow;

sock.onopen = () => {
    console.log('===> Connected Successfully to Streamlabs');
};

sock.onmessage = e => {
    // Remove pending transaction.
    if (pendingTransactions.length <= 0) return;
    var transactionType = pendingTransactions.shift();

    // Parse JSON Data
    var response = JSON.parse(e.data);

    if (transactionType.type === 'sceneRequest') {
        if (response.result[0].name === undefined) {
            console.log('Was unable to parse a result.');
            return;
        }

        var foundScene = response.result.find(x => x.name === transactionType.sceneName);

        if (foundScene === undefined) return;

        console.log(`Transition to Scene: ${transactionType.sceneName}`);
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
        return;
    }
};

function sendSceneRequest(nameOfScene) {
    pendingTransactions.push({ type: 'sceneRequest', sceneName: nameOfScene });
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

setInterval(async () => {
    const res = await activeWin();

    var windowFoundExe = binds.data.find(x => {
        if (res && res.owner.name.toLowerCase().includes(x.windowIncludes.toLowerCase())) return x;
    });

    var windowFound = binds.data.find(x => {
        if (res && res.title.toLowerCase().includes(x.windowIncludes.toLowerCase())) return x;
    });

    if (windowFound === undefined && windowFoundExe === undefined) return;

    if (currWindow === res.id) return;

    currWindow = res.id;

    if (windowFound !== undefined) {
        sendSceneRequest(windowFound.sceneSelect);
    }

    if (windowFoundExe !== undefined) {
        sendSceneRequest(windowFoundExe.sceneSelect);
    }
}, 500);

const activeWin = require('active-win');
const SockJS = require('sockjs-client');
const iohook = require('iohook');
const loadJsonFile = require('load-json-file');
const sock = new SockJS('http://127.0.0.1:59650/api');
const pendingTransactions = [];
const exec = require('child_process').exec;

var currWindow = undefined;

var binds = loadJsonFile.sync('./config.json');

sock.onopen = () => {
    console.log('===> Connected');
};

// Socket Recieve Events
sock.onmessage = e => {
    // Remove pending transaction.
    if (pendingTransactions.length <= 0) return;
    var transactionType = pendingTransactions.shift();

    // Parse JSON Data
    var response = JSON.parse(e.data);

    if (transactionType.type === 'sceneRequest') {
        if (response.result[0].name === undefined) {
            return;
        }

        var foundScene = response.result.find(
            x => x.name === transactionType.sceneName
        );

        if (foundScene === undefined) return;

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

iohook.on('mouseclick', e => {
    activeWin()
        .then(res => {
            var windowFoundExe = binds.find(x =>
                res.owner.name
                    .toLowerCase()
                    .includes(x.windowIncludes.toLowerCase())
            );

            var windowFound = binds.find(x =>
                res.title.toLowerCase().includes(x.windowIncludes.toLowerCase())
            );

            if (windowFound === undefined && windowFoundExe === undefined)
                return;

            if (currWindow === res.id) return;

            console.log(res.id);
            currWindow = res.id;

            if (windowFound !== undefined) {
                console.log(
                    `Attempting transition to: ${windowFound.sceneSelect}`
                );
                sendSceneRequest(windowFound.sceneSelect);

                if (windowFound.audio) {
                    exec(
                        `sounds\\mediarunner.bat sounds\\${windowFound.audio}`,
                        (err, stdout, stderr) => {
                            console.log(stderr);
                        }
                    );
                }
            }

            if (windowFoundExe !== undefined) {
                console.log(
                    `Attempting transition to: ${windowFoundExe.sceneSelect}`
                );
                sendSceneRequest(windowFoundExe.sceneSelect);

                if (windowFound.audio) {
                    console.log('Playing sound...');
                    sound.once('load', () => {
                        exec(
                            `sounds\\mediarunner.bat sounds\\${windowFound.audio}`,
                            (err, stdout, stderr) => {
                                console.log(stderr);
                            }
                        );
                    });
                }
            }
        })
        .catch(() => {});
});

iohook.start();

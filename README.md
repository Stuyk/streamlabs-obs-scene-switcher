![](https://i.imgur.com/B6PuHLg.jpg)

# Streamlabs OBS Scene Switcher

Created by Stuyk (Trevor Wessel)

❤️ Please support my open source work by donating. I'm here to provide general context for complicated procedures for you new developers. ❤️

https://github.com/sponsors/Stuyk/

⭐ This repository if you found it useful!

---

Its not a plugin; but the scene switcher will detect which program you click on then switch to the designated scene.

### IMPORTANT: Use NodeJS 14+

[Check me out on Twitch](https://twitch.tv/stuyksoft/)
[Preview of Switcher](https://clips.twitch.tv/LuckyInspiringMeerkatDeIlluminati)

### Requirements

-   [NodeJS v14+](https://nodejs.org/en/download/)
-   [Python 2.7](https://www.python.org/downloads/release/python-2716/)
-   [node-gyp]()

**If you have trouble with node-gyp. I'm sorry.**
Here's a [link that may help you with node-gyp](https://spin.atomicobject.com/2019/03/27/node-gyp-windows/).

If you get errors with the requirements above; there's not much I can do. Node-gyp is horrible.

### Installation

#### I want this to be easy.

Go to the releases tab at the top; and simply download it.

#### I like lots of pain when I install things:

Download the files in this repo.

In a Powershell or CMD
`npm install`

Run the app by running the `run.bat` or run `node index.js` in a console window.

Keep the console window open while streaming.

Open up Streamlabs OBS; go to your settings and navigate to remote control.
Click on 'show' to display the QR Code. After; you can stream normally.

Scene switching should work normally.

### Configuration

The configuration file will automatically be generated and refreshed after you run the application.

You will need to generate a token and supply it to the configuration.

[Here is a gif on how to do that](https://gfycat.com/DisfiguredAmazingBighornsheep)

After you need to supply the `.exe` for the automatic scene switch.

You can set the `printWindowNames` configuration option to true to see clicked windows.

Your `targetScene` must correspond with the scene name in your streamlabs obs scenes.

```
{
    "token": "slobs settings -> remote control -> click qr code -> show details -> copy api token",
    "printWindowNames": false,
    "scenes": [
        {
            "windowClassName": "Code.exe",
            "targetScene": "CodeScene"
        },
        {
            "windowClassName": "GTA5.exe",
            "targetScene": "GTAScene"
        },
        {
            "windowClassName": "brave.exe",
            "targetScene": "BrowserView"
        },
        {
            "windowClassName": "explorer.exe",
            "targetScene": "DesktopView"
        }
    ]
}
```

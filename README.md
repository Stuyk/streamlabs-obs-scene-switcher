# Streamlabs OBS Scene Switcher

Its not a plugin; but the scene switcher will detect which program you click on then switch to the designated scene.

[Check me out on Twitch](https://twitch.tv/stuyksoft/)
[Preview of Switcher](https://clips.twitch.tv/LuckyInspiringMeerkatDeIlluminati)

### Requirements

-   [NodeJS v12+](https://nodejs.org/en/download/)
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

Basic idea behind this. It looks for partial window titles.
Use Streamlabs OBS window picker thing to pick windows and see some of their titles. Base it on that. Never do the full window title. Only partial.

```
windowIncludes = WindowTitle
sceneSelect = FULL name of the scene in StreamLabs
```

You can add as many scenes and windows as you want.

```
[
    {
        "windowIncludes": "alt:V",
        "sceneSelect": "GTAScene"
    },
    {
        "windowIncludes": "Visual Studio Code",
        "sceneSelect": "CodeScene"
    }
]
```

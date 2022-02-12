'use strict'

const vscode = require('vscode')
const path = require('path')
const sound = require('sound-play')  // https://www.npmjs.com/package/sound-play

var audioResourcePath
var timerId
var lastHour


function doBeep() {
    if (audioResourcePath) {
        // just read config every hour instead of tracking changes as they come
        const configuration = vscode.workspace.getConfiguration('hourlybeep', null)
        const volume = configuration.get('volume', 84) || 84
        var adjustedVolume = volume / 100.0
        if (adjustedVolume < 0.0) { adjustedVolume = 0.0 }
        if (adjustedVolume > 1.0) { adjustedVolume = 1.0 }

        sound.play(audioResourcePath, adjustedVolume)
    }
}

function callback() {
    var date = new Date()
    var currHour = date.getHours()
    if (lastHour && (currHour != lastHour)) {
        doBeep()
    }
    lastHour = currHour
}

function startTimer() {
    stopTimer()
    timerId = setInterval(callback, 1000)
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId)
        timerId = null
    }
}


/** @param {vscode.ExtensionContext} context */
function activate(context) {
    audioResourcePath = path.resolve(context.extensionPath, 'resources/Default.wav')
    startTimer()
}
exports.activate = activate

function deactivate() {
    stopTimer()
}
exports.deactivate = deactivate

vscode.commands.registerCommand('hourlybeep.test', () => {
    doBeep()
})

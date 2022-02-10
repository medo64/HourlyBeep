'use strict'

const vscode = require('vscode')
const path = require('path')
const sound = require('sound-play')  // https://www.npmjs.com/package/sound-play

var audioResourcePath
var timerId
var lastHour


function callback() {
    var date = new Date()
    var currHour = date.getHours()
    if (lastHour && (currHour != lastHour)) {
        if (audioResourcePath) {
            sound.play(audioResourcePath)
        }
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
    audioResourcePath = path.resolve(context.extensionPath, 'resources/S-2718Hz.wav')
    startTimer()
}
exports.activate = activate

function deactivate() {
    stopTimer()
}
exports.deactivate = deactivate

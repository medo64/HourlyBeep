'use strict'

const vscode = require('vscode')
const path = require('path')
const player = require('play-sound')({})

var audioResourcePath
var timerId
var lastHour


function callback() {
    var date = new Date()
    var currHour = date.getHours()
    if (lastHour && (currHour != lastHour)) {
        if (audioResourcePath) {
            player.play(audioResourcePath, { timeout: 300 }, function (err) {
                if (err) throw err
            })
        }
    }
    lastHour = currHour
}

function startTimer() {
    stopTimer()
    timerId = setInterval(callback, 1000);
}

function stopTimer() {
    if (timerId) {
        clearInterval(timerId)
        timerId = null
    }
}


/** @param {vscode.ExtensionContext} context */
function activate(context) {
    audioResourcePath = path.resolve(context.extensionPath, 'resources/3141Hz.mp3')
    startTimer()
}
exports.activate = activate

function deactivate() {
    stopTimer()
}
exports.deactivate = deactivate

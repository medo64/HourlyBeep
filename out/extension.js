'use strict'

const vscode = require('vscode')
const path = require('path')
const sound = require('sound-play')  // https://www.npmjs.com/package/sound-play

var timerId
var lastMinute
var audioResourcePath

let configVolume
let configMinutes

/** @param {string} [extensionPath] */
function updateConfiguration(extensionPath) {
    if (extensionPath) {  // always updates the first time - will make it configurable later
        audioResourcePath = path.resolve(extensionPath, 'resources/Default.wav')
    }

    const configuration = vscode.workspace.getConfiguration('hourlybeep', null)

    const volume = configuration.get('volume', 84) || 84
    let adjustedVolume = volume / 100.0
    if (adjustedVolume < 0.0) { adjustedVolume = 0.0 }
    if (adjustedVolume > 1.0) { adjustedVolume = 1.0 }
    configVolume = adjustedVolume

    const minutes = configuration.get('minutes', [0]) || [0]
    configMinutes = minutes.sort().filter(function(item, pos) { return minutes.indexOf(item) == pos })  // just to remove duplicates
}

/** @param {number} [volume] */
function doBeep(volume) {
    if (audioResourcePath) {
        sound.play(audioResourcePath, volume)
    }
}

function callback() {
    var date = new Date()
    var currMinute = date.getMinutes()
    if (lastMinute && (currMinute != lastMinute)) {
        configMinutes.every((/** @type {number} */ minute) => {
            if (minute == currMinute) {
                doBeep()
                return false
            }
            return true
        })
    }
    lastMinute = currMinute
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
    // @ts-ignore
    const isDebug = (context.extensionMode === 2)

    updateConfiguration(context.extensionPath)
    startTimer()

    vscode.workspace.onDidChangeConfiguration(() => {
        if (isDebug) { console.debug(new Date().getTime() + ' onDidChangeConfiguration()') }
        updateConfiguration()
    }, null, context.subscriptions)
}
exports.activate = activate

function deactivate() {
    stopTimer()
}
exports.deactivate = deactivate

vscode.commands.registerCommand('hourlybeep.test', () => {
    doBeep(configVolume)
})

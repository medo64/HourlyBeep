'use strict'

const vscode = require('vscode')
const path = require('path')
const sound = require('sound-play')  // https://www.npmjs.com/package/sound-play

let timerId
let lastMinute
let audioResourcePath

let configIsDebug = false
let configVolume = 0.84
let configMinutes = [ 0 ]

/** @param {vscode.ExtensionContext} [context] */
function updateConfiguration(context) {
    if (context) {  // always updates the first time - will make it configurable later
        configIsDebug = (context.extensionMode === 2)

        const extensionPath = context.extensionPath
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

function doBeep() {
    if (audioResourcePath) {
        sound.play(audioResourcePath, configVolume)
    }
}

function callback() {
    const date = new Date(Date.now() + 1000)  // just go 1 second to the future to avoid being late to the party
    const currMinute = date.getMinutes()
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
    updateConfiguration(context)
    startTimer()

    vscode.workspace.onDidChangeConfiguration(() => {
        if (configIsDebug) { console.debug(new Date().getTime() + ' onDidChangeConfiguration()') }
        updateConfiguration()
    })

    if (configIsDebug) { console.debug(new Date().getTime() + ' activated()') }
}
exports.activate = activate

function deactivate() {
    stopTimer()
    if (configIsDebug) { console.debug(new Date().getTime() + ' deactivated()') }
}
exports.deactivate = deactivate

vscode.commands.registerCommand('hourlybeep.test', () => {
    if (configIsDebug) { console.debug(new Date().getTime() + ' onHourlyBeepTest()') }
    doBeep()
})

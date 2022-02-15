'use strict'

const VSCode = require('vscode')

const Readable = require('stream').Readable
const BufferAlloc = require('buffer-alloc')  // npm install --save buffer-alloc
const Speaker = require('speaker')  // https://www.npmjs.com/package/speaker - https://github.com/TooTallNate/node-speaker

let timerId
let lastMinute

const audioBitDepth = 16
const audioChannels = 2
const audioSampleRate = 44100

let configIsDebug = false
let configAudioBuffer
let configMinutes

/** @param {VSCode.ExtensionContext} [context] */
function updateConfiguration(context) {
    if (context) {  // always updates the first time - will make it configurable later
        configIsDebug = (context.extensionMode === 2)
    }

    const configuration = VSCode.workspace.getConfiguration('hourlybeep', null)

    const volume = configuration.get('volume', 84) || 84
    let adjustedVolume = volume / 100.0
    if (adjustedVolume < 0.0) { adjustedVolume = 0.0 }
    if (adjustedVolume > 1.0) { adjustedVolume = 1.0 }

    const tones = [440.00, 0.00, 293.66]
    configAudioBuffer = getAudioBuffer(tones, adjustedVolume)

    const minutes = configuration.get('minutes', [0]) || [0]
    configMinutes = minutes.sort().filter(function (item, pos) { return minutes.indexOf(item) == pos })  // just to remove duplicates
}

/**
 * @param {number[]} tones
 * @param {number} volume
 * @returns BufferAlloc
 */
function getAudioBuffer(tones, volume) {
    const toneCount = tones.length
    const toneDuration = 42  // ms
    const amplitude = (2 ** (audioBitDepth - 1) - 8) * volume
    const toneSamples = Math.floor(audioSampleRate * toneDuration / 1000)
    const sampleSize = audioBitDepth / 8
    const channelSize = sampleSize * audioChannels
    const toneSize = toneSamples * channelSize

    const buffer = BufferAlloc(toneCount * toneSize)

    for (let n = 0; n < toneCount; n++) {
        const frequency = tones[n]
        const t = (Math.PI * 2 * frequency) / audioSampleRate

        for (let i = 0; i < toneSamples; i++) {
            const value = Math.round(amplitude * Math.sin(t * i)) // sine wave

            for (let c = 0; c < audioChannels; c++) {
                const offset = (n * toneSize) + (i * channelSize) + (c * sampleSize)
                buffer[`writeInt${audioBitDepth}LE`](value, offset)
            }
        }
    }

    return buffer
}

function doBeep() {
    if (configAudioBuffer) {
        const sine = new Readable()
        sine.push(configAudioBuffer)
        sine.push(null)

        const speaker = new Speaker({
            channels: audioChannels,
            bitDepth: audioBitDepth,
            sampleRate: audioSampleRate,
        })

        sine.pipe(speaker)
    }
}

function callback() {
    if (configMinutes) {
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


/** @param {VSCode.ExtensionContext} context */
function activate(context) {
    // @ts-ignore
    updateConfiguration(context)
    startTimer()

    VSCode.workspace.onDidChangeConfiguration(() => {
        if (configIsDebug) { console.debug(new Date().getTime() + ' onDidChangeConfiguration()') }
        updateConfiguration()
    })

    context.subscriptions.push(
        VSCode.commands.registerCommand('hourlybeep.test', () => {
            if (configIsDebug) { console.debug(new Date().getTime() + ' onHourlyBeepTest()') }
            doBeep()
        })
    )

    if (configIsDebug) { console.debug(new Date().getTime() + ' activated()') }
}
exports.activate = activate

function deactivate() {
    stopTimer()
    if (configIsDebug) { console.debug(new Date().getTime() + ' deactivated()') }
}
exports.deactivate = deactivate

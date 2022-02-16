Hourly Beep
===========

This extension will do a gentle beep upon every hour. No more, no less. Ok, a
bit more.


## Extension Settings

This extension contributes the following setting:

* `hourlybeep.volume`: Beep volume between 0 and 100.
* `hourlybeep.minutes`: Array of minutes at which beep will sound.


### Default Configuration

```json
"hourlybeep.volume": 84,
"hourlybeep.minutes": [ 0 ],
```


### Beep every 30 minutes

```json
"hourlybeep.minutes": [ 0, 30 ],
```


## Known Issues

### Doesn't Work On Linux

Unfortunately, this extension doesn't work on both Windows and Linux. While I
can publish it for either, I am currently not able to publish it for both at
the same time. Thus I decided to publish it for Windows.

Will try to make it work for both (at the same time) some time in the future.

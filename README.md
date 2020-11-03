# signalk-tank-monitor

Display tank levels.

__signalk-tank-monitor__ implements a webapp for the [Signal K Node server](https://github.com/SignalK/signalk-server-node) that presents a simple bar-chart showing the levels of all tanks reported in Signal K.

The Signal K configuration interface can be used to modify the appearance of the generated display including by the addition of user-defined text and graphic alerts.

![Specimen screenshot](screenshot.png)

## Installation

Download and install __signalk-tank-monitor__ using the *Appstore* menu option in your Signal K Node server console. The plugin can also be obtained from the [project homepage](https://github.com/preeve9534/signalk-tank-monitor) and installed using [these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

## Using the plugin

The plugin is enabled by default and after installation you should be able to immediately view available tank data by selecting *Signalk-Tank-Monitor* in your host server's *Webapps* interface.

## Configuration

The behaviour of __signalk-tank-monitor__ and the appearance of the generated web page can be adjusted using the configuration interface at *Server->Plugin Config->Tank monitor*.

Configuration involves specifying one or more *tweaks*. Each tweak is characterised by the following properties, all of which are optional.

__path__\
This string identifies the scope of application of the properties defined within the containing tweak and should consist of a tank path prefix. If no __path__ is specified, then the tweak will apply to all tank paths (equivalent to specifying the value "tanks."), otherwise the tweak will only apply to those tank paths that begin with the supplied value. Properties defined in a tweak with a specific __path__ value override any that may have been defined in tweaks with a more general __path__ value.

Example: restrict this tweak to just tanks containg waste:
```
{ "path": "tanks.wasteWater.", ..... }
```

__ignore__\
This boolean property specifies whether or not tank data from sources selected by __path__ should be ignored or not.

Example: ignore data from fuel tank two:
```
{ "path": "tanks.fuel.2.", "ignore": true }
```

__name__\
This string property introduces a text string that will be used to label tank data from sources selected by __path__. If name is omitted then its value will default to the value of the token used by Signal K as the second element of a tank path.

Example: change the display name for waste tanks from "wasteWater" to "Waste":
```
{ "path": "tanks.wasteWater.", "name": "Waste" }
```
 
__color__\
This string property introduces a text string that will be used to specify the colour used for the display of tank data from sources selected by __path__.

Example: display fuel data in red:
```
{ "path": "tanks.fuel.", "color": "red" }
```

__factor__\
This decimal property specifies a scaling factor that will be used to adjust tank data received from sources selected by __path__.

Example: convert all tank data from cubic metres to gallons:
```
{ "factor": 264.172 }
```

__places__\
This integer property specifies the number of decimal places that should be used for displaying tank data from sources selected by __path__.

Example: display tank data with no decimal part.
```
{ "places": 0 }
```

__labels__\
This array property gathers together a collection of label definitions. Each label definition supplies some text or iconography which will be used to decorate the data source selected by __path__ and defines whether or not the label should be displayed permanently or only when some trigger condition is met.

Each label definition may include the following properties.

__content__\
This string property specifies some text or the name of an SVG icon file which will form the displayed element.

__trigger__\
If present, then this string property supplies a trigger condition which must evaluate to true for label __content__  to be displayed.

A trigger condition is always formed from a Signal K path and some implied or explicit condition that path values will be tested against.  There are several possible styles of trigger condition.

*path* - use the value returned by *path* as-is: so, if *path* returns a non-zero value then __content__ will be displayed.
 
*path*__<__*value* - only display __content__ if the value returned from *path* is less than *value*.

*path*__>__*value* - only display __content__ if the value returned from *path* is greater than *value*.

*path*__+__*value*[__,__*sample-size*] - only display __content__ if the value returned from *path* is greater than a computed average of previous values by *value*. If specified, *sample-size* gives the number of accumulated values used to derive the average (defaults to 50 readings).

*path*__-__*value*[__,__*sample-size*] - only display __content__ if the value returned from *path* is greater than a computed average of previous values by *value*. If specified, *sample-size* gives the number of accumulated values used to derive the average (defaults to 50 readings).

*notification_path* - only display __content__  if there is an active  notification on *notification-path*.

*notification-path*__:__*state* - only display __content__  if there is an active  notification on *notification-path* and its state property is equal to *state*.

Example: display an alert icon when the fresh-water level in tank two is below 10%.
```
{ "path": "tanks.freshWater.2", "labels": [ { "content": "icons/alert.svg", "trigger": "tanks.freshWater.2.currentState<0.1" } ] }
```

## Example configuration

My configuration file is listed below. For the purpose of exposition, the JSON has been re-formatted to show one-tweak-per line (the order of tweaks is irrelevant).

1. Use the "name" property to apply nice fluid names (lines 013-017). These are the default tweaks that ship with the plugin.

2. Use the "color" property to display fuel data in red (line 013).

3. Use the "ignore" property to deal with a buggy Maretron multi-channel tank-level sensor module. This device sporadically transmits junk data for unused tank sensor inputs and I get around this issue by explicitly stopping the plugin from from processing data for all tanks (line 007) and then selectively enabling processing of data for each of my five real inputs (lines 008-012).

4. Use the "labels" property to add a visual alert when the waste discharge pump is running (line 008). 

```
001:     {
002:       "enabled": true,
003:       "enableLogging": false,
004:       "enableDebug": false,
005:       "configuration": {
006:         "tweaks": [
007:           { "ignore": true },
008:           { "path": "tanks.wasteWater.0", "ignore": false, "labels": [ { "content": "DISCHARGING", "trigger": "electrical.switches.15.1.state" } ] },
009:           { "path": "tanks.freshWater.1", "ignore": false, "labels": [ { "content": "FILLING", "trigger": "tanks.freshWater.1.currentLevel+0.01" } ] },
010:           { "path": "tanks.freshWater.2", "ignore": false },
011:           { "path": "tanks.fuel.3", "ignore": false },
012:           { "path": "tanks.fuel.4", "ignore": false },
013:           { "path": "tanks.fuel", "name": "Fuel", "color": "red" },
014:           { "path": "tanks.freshWater", "name": "Water" },
015:           { "path": "tanks.wasteWater", "name": "Waste" }
016:         ]
017:       }
018:     }
```


## Author

Paul Reeve <preeve@pdjr.eu>\
November 2020

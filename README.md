# signalk-tank-monitor

Display tank levels.

This project implements a webapp for the
[Signal K Node server](https://github.com/SignalK/signalk-server-node).

__signalk-tank-monitor__ implements a web-page presenting a simple
bar-chart showing the levels of all tanks reported in Signal K.

The appearance of the display can be configured and extended to include
alarm and other notifications.

[Specimen screenshot](screenshot.png)

## Installation

Download and install __signalk-tank-monitor__ using the "Appstore" menu
option in your Signal K Node server console.
The plugin can also be obtained from the 
[project homepage](https://github.com/preeve9534/signalk-tank-monitor)
and installed using
[these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

## Using the plugin

The plugin is enabled by default and you should be able to view all
available tank data by pointing your browser to

http://*my-server-address*:*my-server-port*/signalk-tank-monitor/

## Configuration

The behaviour of __signalk-tank-monitor__ and the appearance of the
web page it generates can be adjusted using the plugin configuration
page accessed  
configuring one or more *tweaks*.
Each tweak is characterised by the following properties, all of which
are optional.

__path__\
This property can be used to specify a string which will be used to
select which Signal K tank paths the properties within the tweak apply.
If no __path__ is specified, then the tweak will apply to all tank
paths, otherwise it will only apply to those tank paths that begin
with the supplied __path__ value.
Propertied supplied by a tweak with a more specific __path__ value
override properties supplied by a tweaks with less specific __path__
values.

__ignore__\
This boolean property specifies whether or not the tank path matching
__path__ should be ignored or not.
Example: ignore data from fuel tank two:
```
{ "path": "tanks.fuel.2", "ignore": true }
```

__name__\
Can be used to supply a text string that will be used to label the
output deriving from tank paths that match __path__.
If name is omitted then the displayed label will simply be the token
supplied by Signal K as the second element of a tank path.
Example: change the display name for waste tanks:
```
{ "path": "tanks.wasteWater", "name": "Waste" }
```
 
__color__\
Can be used to specify a particular RGB color for display of data
derived from tank paths that match __path__.
Example, to display fuel data in red:
```
{ "path": "tanks.fuel", "color": "#ff0000" }
```

__factor__\
Multiply incoming data by this factor before display.
Default is 1.0.
Example: convert all tank data from cubic metres to litres:
```
{ "factor": 1000 }
```

__places__\
Restrict displayed data values to a specific number of decimal places.
Default is 3.
Example: display tank data with no decimal part.
```
{ "places": 0 }
```

__labels__\
Decorate this __path__ with some text or iconography, perhaps
conditionally.
Each entry in the __labels__ array defines a label which will be
displayed at the top of the data region associated with __path__.
There are two properies for each label definition.

__label__\
Specifies some text or the name of an SVG icon file which will form the
displayed element.

__trigger__\
Is optional: if present, __label__ is only displayed when the trigger
value is true; if absent, the the __label__ is displayed continuously.
There are a number of possibilities for __trigger__:

*path*\
*path*[__<__*state*]\
*path*[__>__*state*]\
*notification_path*[__!__*state*]



## Debugging and logging

The plugin understands the following debug keys.

| Key | Meaning                                                                                                   |
|:-------------------|:-------------------------------------------------------------------------------------------|
| switchbank:\*      | Enable all keys.                                                                           | 
| switchbank:actions | Log each output action taken by the plugin.                                                |
| switchbank:rules   | Log each rule loaded by the plugin and indicate whether it was successfully parsed or not. |

## Author

Paul Reeve <preeve@pdjr.eu>\
October 2020

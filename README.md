# signalk-tank-monitor

Display tank levels.

__signalk-tank-monitor__ implements a webapp and plugin for the [Signal K Node server](https://github.com/SignalK/signalk-server-node).

The webapp presents a simple bar-chart showing the levels of all tanks reported in Signal K. Signal K's plugin configuration interface can be used to customise the webapp display including by the addition of user-defined text and graphic alerts.

The plugin optionally supports background logging of time-series tank data using [RRD Tool](https://oss.oetiker.ch/rrdtool/) and if this feature is enabled then the webapp is enhanced to include the display of historic tank level data over various time frames.

$![Specimen screenshot](screenshot.png)

## System requirements

__signalk-tank-monitor__ has no special installation requirements.

If you wish to log time-series tank data then [RRDTool](https://oss.oetiker.ch/rrdtool/) must either be installed on the local host or a available as a network service.

## Installation

Download and install __signalk-tank-monitor__ using the *Appstore* menu option in your Signal K Node server console. The plugin can also be obtained from the [project homepage](https://github.com/preeve9534/signalk-tank-monitor) and installed using [these instructions](https://github.com/SignalK/signalk-server-node/blob/master/SERVERPLUGINS.md).

## Using the plugin

The plugin is enabled by default and after installation you should be able to immediately view all tank data available in Signal K by selecting *Signalk-Tank-Monitor* in your host server's *Webapps* interface.

## Configuration

The behaviour of __signalk-tank-monitor__ and the appearance of the generated web page can be adjusted using the configuration interface at *Server->Plugin Config->Tank monitor*.

Configuration involves specifying one or more *tweaks* each of which contains one or more configuration properties. A tweak is either global in scope (that is it applies to every tank data stream) or specialised so that it applies to only a restricted number (perhaps just a single) data stream.  Specialisation is achieved by including a __path__ property within a tweak which defines the restriction that should be imposed on all other tweak properties. More specialised tweak's exert more influence than their less specialised siblings. For example, the following pair of tweaks sets the display color of all tank data channels to white and then overrides this to set the display color of fuel channels to red:
```
[
  { "color": "#FFFFFF" }, // Display data from all tanks in white
  { "path": "tanks.fuel.", "color": "#FF0000" } // But make sure to display fuel tank data in red
]
```

If you intend using the plugin to log historical tank data, then you should first of all use one or more tweaks to ensure that the webapp is displaying the data you want to be logged before you enable logging.

## Tweaks

The following properties can be used within a tweak.

__Apply this tweak to tank paths that begin with__ [path]\
This string property identifies the scope of application of the containing tweak and should consist of a tank path prefix. If no __path__ is specified, then the tweak will apply to all tank paths (equivalent to specifying the value "tanks."), otherwise the tweak will only apply to those tank paths that begin with the supplied value. Properties defined in a tweak with a specific __path__ value override any that may have been defined in tweaks with a more general __path__ value.

Example: restrict this tweak to just data describing tanks containg waste water:
```
{ "path": "tanks.wasteWater.", ..... }
```

__Ignore this data completely?__ [ignore]\
This boolean property specifies whether or not tank data from sources selected by __path__ should be ignored or not.

Example: ignore data from fuel tank two:
```
{ "path": "tanks.fuel.2", "ignore": true }
```

__Log time-series data?__ [log]\
This boolean property specifies whether or not tank data from sources selected by __path__ should be logged. Because the paths available to Signal K are not necessarily always present this property should only be applied when the associated __path__ is fully qualified.

__rrd__\
This boolean property specifies whether or not tank data from sources selected by __path__ should be logged or not. If sources are logged then historical data can be accessed through the webapp interface.

Example: log time series date for all tanks:
```
{ "rrd": true }
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

*path*__+__*value*[__,__*sample-size*] - only display __content__ if the value returned from *path* is greater than a computed average of previous values by *value*. If specified, *sample-size* gives the number of accumulated values used to derive the average (defaults to 30 readings).

*path*__-__*value*[__,__*sample-size*] - only display __content__ if the value returned from *path* is less than a computed average of previous values by *value*. If specified, *sample-size* gives the number of accumulated values used to derive the average (defaults to 30 readings).

*notification_path* - only display __content__  if there is an active  notification on *notification-path*.

*notification-path*__:__*state* - only display __content__  if there is an active  notification on *notification-path* and its state property is equal to *state*.

Example: display an alert icon when the fresh-water level in tank two is below 10%.
```
{ "path": "tanks.freshWater.2", "labels": [ { "content": "icons/alert.svg", "trigger": "tanks.freshWater.2.currentState<0.1" } ] }
```

## Data logging configuration

Data logging is disabled by default. If you want to use this feature, then take note of the installation requirements discussed above. The following configuration properties apply.

__Enable time series logging?__ (rrdenabled)\
If checked, then the plugin will attempt to log data to an RRD database called 'tankmonitor.rrd'.

If, as is most likely, you are not using a data cacheing service provided by rrdcached(1) then this file will be created in the folder specified by the following property.

If you are using a data cacheing service, then this file will be created in the root of the working directory which you specified when you started the service. In this case, you must specify this directory location in the following property so that RRD tool's graphing application can find the database. In the very unlikely event that you are using a remote cacheing service, then you will need to make your own arrangements for generating and displaying graphical representations of logged data.

__Folder containing 'tankmonitor.rrd'__ (rrdfolder)\
This value defaults to the value 'rrd/', which specifies the ```rrd/``` folder in the plugin's installation directory. If you are not using an rrdcached(1) service, then there is no need to change this.

If you are using an rrdcached(1) service on the local host, then the plugin needs to know where the cacheing daemon has placed ```tankmonitor.rrd``` and you should specify that folder here.

__Connect to the RRD daemon at__ (rrdcstring)\
If you have an rrdcached(1) service available and you want to use it, then you have two options:

1. Your daemon listens on a Unix pipe. In this case, specify a string of the form "*path*" where *path* is the name of the FIFO file on the local host that is monitored by the RRD daemon.

2. Your daemon listens on a TCP/IP port. In this case, specify a string of the form "*hostname*__:__*port*" where *hostname* is the IP address or hostname of the daemon's server and *port* is the port number on which the daemon listens.

If you are not running rrdcached(1), then leave this property value undefined and the plugin will use rrdtool(1) for all database manipulation.

## Example configuration

My configuration file is listed below. For the purpose of exposition, the JSON has been re-formatted to show one-tweak-per line (the order of tweaks is irrelevant).

1. Use the "name" property to apply nice fluid names (lines 013-017). These are the default tweaks that ship with the plugin.

2. Use the "color" property to display fuel data in red (line 013).

3. Use the "ignore" property to deal with a buggy Maretron multi-channel tank-level sensor module. This device sporadically transmits junk data for unused tank sensor inputs and I get around this issue by explicitly stopping the plugin from from processing data for all tanks (line 007) and then selectively enabling processing of data for each of my five real inputs (lines 008-012).

4. Use the "labels" property to add a visual alert when the waste discharge pump is running (line 008). 

5. Log tank readings to a time-series database (line 006) located in the specified folder (line 009).

6. Connect to a cacheing daemon litsening on the specified Unix domain socket (line 010).

```
001:     {
002:       "enabled": true,
003:       "enableLogging": false,
004:       "enableDebug": false,
005:       "configuration": {
             "rrdenabled": true,
             "rrdfolder": "/var/rrd/",
             "rrdcstring": "/var/rrd/rrdcached.sock",
006:         "tweaks": [
007:           { "ignore": true },
008:           { "path": "tanks.wasteWater.0", "ignore": false, "log": true, "labels": [ { "content": "DISCHARGING", "trigger": "electrical.switches.15.1.state" } ] },
009:           { "path": "tanks.freshWater.1", "ignore": false, "log": true, "labels": [ { "content": "FILLING", "trigger": "tanks.freshWater.1.currentLevel+0.01" } ] },
010:           { "path": "tanks.freshWater.2", "ignore": false, "log": true },
011:           { "path": "tanks.fuel.3", "ignore": false, "log": true },
012:           { "path": "tanks.fuel.4", "ignore": false, "log": true },
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
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTczMTA2MTkzMV19
-->
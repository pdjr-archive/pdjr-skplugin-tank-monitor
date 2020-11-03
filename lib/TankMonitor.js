class TankMonitor {

  static create(options = {}) {
    options.tweaks = (options.tweaks !== undefined)?options.tweaks:[];

    if (window.parent.window.SignalkClient) {
      return(new TankMonitor(window.body, window.parent.window.SignalkClient, options));
    } else {
      return(new TankMonitor(window.body, new SignalkClient(window.location.hostname, window.location.port), options));
    }

    return(null);
  }

  constructor(container, client, options) {

    if (!client) throw "TankMonitor: signalkClient must be specified";
    if (!options.container) options.container = document.body;

        this.signalkClient = client;
        this.options = options;
        this.tanks = new Set();

        this.signalkClient.waitForConnection().then(_ => {
            this.signalkClient.getEndpoints(endpoints => {
                endpoints.filter(endpoint => (endpoint.startsWith('tanks.'))).forEach(endpoint => {
                    var tweak = this.tweak(endpoint);
                    if (!tweak.ignore) this.tanks.add(endpoint.substr(0, endpoint.lastIndexOf('.')));
                });
            });
            var tankChart = PageUtils.createElement('div', null, 'tank-chart flex-container', null, this.options.container);
            [...this.tanks].forEach(tank => tankChart.appendChild(this.makeTankBar(tank)));
        });

    }

    makeTankBar(tankpath) {
        var tankBar = PageUtils.createElement('div', tankpath, 'tank-bar', null, null);
        tankBar.appendChild(this.makeTankCard(tankpath));
        tankBar.appendChild(this.makeTankGraph(tankpath));
        return(tankBar);
    }

    makeTankCard(tankpath) {
      var tankCard = PageUtils.createElement('div', null, 'tank-card', null, null);
      var tweak = this.tweak(tankpath);
      for (var i = 0; i < 10; i++) {
        var tankCardRegion = PageUtils.createElement('div', null, 'tank-card-region', null, tankCard);
        if ((i == 0) && (tweak.labels)) this.addLabelElements(tankCardRegion, tweak.labels);
        if (i == 9) this.addLegendElements(tankCardRegion, tankpath, tweak);
      }
      return(tankCard);
    }

    addLegendElements(container, tankpath, tweak) {
      let tankName = PageUtils.createElement('div', null, 'tankname', this.getMeaningfulName(tankpath, tweak), container);
      let tankData = PageUtils.createElement('div', null, 'tankdata', null, container);
      let tankLevel = PageUtils.createElement('span', null, 'tanklevel', null, tankData);
      tankData.appendChild(document.createTextNode(' / '));
      let tankCapacity = PageUtils.createElement('span', null, 'tankcapacity', null, tankData);
      this.signalkClient.getValue(tankpath + ".capacity", (v) => { tankCapacity.innerHTML = this.getAdjustedValue(v, tweak); });
      this.signalkClient.registerCallback(tankpath + ".currentLevel", (v) => { tankLevel.innerHTML = this.getAdjustedValue(v * (tankCapacity.innerHTML / ((tweak.factor === undefined)?1:tweak.factor)), tweak); });
    }

    addLabelElements(container, labeldefs) {
      container.classList.add('label');
      var label = undefined;
      labeldefs.reduce((a,labeldef) => {
        if (labeldef.content) {
          if (labeldef.content.includes(".svg")) {
            label = PageUtils.createElement('img', null, 'icon', labeldef.content, container);
          } else {
            label = PageUtils.createElement('span', null, 'text', labeldef.content, container);
          }
        }
        if ((label) && (labeldef.trigger)) {
          label.classList.add('alert', 'hidden');
          var triggerParts = labeldef.trigger.split(/:|<|>/);
          console.log(triggerParts);

          this.signalkClient.registerCallback(triggerParts[0], (v) => {
            if (this.triggerTest(labeldef.trigger, v)) {
              label.classList.remove('hidden');
            } else {
              label.classList.add('hidden');
            }
          });
        }
        a.appendChild(label);
        return(a);
      }, container); 
    }
   


    makeTankGraph(tankpath) {
      var tweak = this.tweak(tankpath);
      let tankGraph = PageUtils.createElement('div', null, 'tank-graph', null, null);
      if (tweak.color) tankGraph.style.backgroundColor = tweak.color;
      let tankGraphPercent = PageUtils.createElement('div', null, 'tank-graph-percent', "---", tankGraph);
      this.signalkClient.registerCallback(tankpath + ".currentLevel", (v) => {
        var percent = "" + Math.floor(v * 100) + "%";
        tankGraph.style.height = percent;
        tankGraphPercent.innerHTML = percent;
        if (v < 0.12) { tankGraphPercent.classList.add('hidden'); } else { tankGraphPercent.classList.remove('hidden'); }
      });
      return(tankGraph);
    }

    getTankNumber(path) {
      var parts = path.split('.');
      return((parts[2] !== undefined)?parts[2]:0);
    }

    getMeaningfulName(path, tweak) {
      var parts = path.split('.');
      return("Tank " + parts[2] + (" (" + ((tweak.name !== undefined)?tweak.name:parts[1]) + ")"));
    }

    getAdjustedValue(v, tweak) {
        return((v * ((tweak.factor === undefined)?1:tweak.factor)).toFixed(((tweak.places === undefined)?0:tweak.places)));
    }

    tweak(path) { 
      var tweaks = this.options.tweaks.sort((a,b) => (a.path === undefined)?-1:((b.path === undefined)?+1:(a.path.length - b.path.length)));
      console.log("%o", tweaks);
      var retval = tweaks.reduce((a, v) => {
        if ((v.path == undefined) || path.startsWith(v.path)) {
          Object.keys(v).filter(k => (k != 'path')).forEach(k => { a[k] = v[k]; });
        }
        return(a);
      }, {});
      return(retval);
    }

    triggerTest(trigger, v) {
      var retval = false;
      var parts = trigger.split(/:|<|>/);
      switch (parts.length) {
        case 1: // trigger is an undecorated path
          if (parts[0].startsWith("notifications.")) {
          } else {
            retval = v;
          }
          break;
        case 2:
          if (trigger.includes(':')) {
            if (trigger.startsWith("notification.")) {
              retval = (value.state == parts[1]);
            }
          } else if (trigger.includes('<')) {
            retval = (v < parts[1]);
          } else if (trigger.includes('>')) {
            retval = (v > parts[1]);
          }
        default:
          break;
      }
      return(retval);
    }
}

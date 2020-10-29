class TankMonitor {

  static create(options = {}) {
    if (options.container === undefined) options.container = window.body;
    if (options.server === undefined) options.server = window.location.hostname;
    if (options.port === undefined) options.port = window.location.port;
    if (options.factor === undefined) options.factor = 1;
    if (options.ignorepaths === undefined) options.ignorepaths = [];
    if (options.fluidnames === undefined) options.fluidnames = {};

    if (window.parent.window.SignalkClient) {
      return(new TankMonitor(window.parent.window.SignalkClient, options));
    }

    if (options) {
      if ((options.server) && (options.port)) {
        return(new TankMonitor(new SignalkClient(options.server, options.port), options));
      }
    }

    return(null);
  }

    constructor(signalkClient, options) {
        if ((options) && (options.debug)) console.log("TankMonitor(%s,%s)...", signalkClient, JSON.stringify(options));

        if (!signalkClient) throw "TankMonitor: signalkClient must be specified";
        if (options.container) options.container = (typeof options.container === 'string')?document.querySelector(options.container):options.container;
        if (!options.container) options.container = document.body;
        if (!options.debug) options.debug = false;

        this.signalkClient = signalkClient;
        this.options = options;
        this.tanks = new Set();

        signalkClient.waitForConnection().then(_ => {
            signalkClient.getEndpoints(endpoints => {
                endpoints.filter(endpoint => (endpoint.startsWith('tanks.'))).forEach(endpoint => {
                    if (!endpoint.includes("undefined")) this.tanks.add(endpoint.substr(0, endpoint.lastIndexOf('.')));
                });
            });
            var tankChart = PageUtils.createElement('div', null, 'tank-chart flex-container', null, this.options.container);
            [...this.tanks].filter(tank => (!options.ignorepaths.includes(tank))).forEach(tank => tankChart.appendChild(this.makeTankBar(tank)));
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
      let tankCardRegion = null;
      for (var i = 0; i < 10; i++) {
        tankCardRegion = PageUtils.createElement('div', null, 'tank-card-region', null, tankCard);
      }
      PageUtils.createElement('div', null, 'tankname', this.getMeaningfulName(tankpath), tankCardRegion);
      let tankData = PageUtils.createElement('div', null, 'tankvalues', null, tankCardRegion);
      let tankCapacity = PageUtils.createElement('span', null, 'tank-capacity', null, null);
      let tankLevel = PageUtils.createElement('span', null, 'tank-level', null, null);
      let separator = document.createTextNode(' / ');
      tankData.appendChild(tankLevel);
      tankData.appendChild(separator);
      tankData.appendChild(tankCapacity);
      this.signalkClient.getValue(tankpath + ".capacity", (v) => { tankCapacity.innerHTML = (this.options.factor * Math.floor(v)); });
      this.signalkClient.registerCallback(tankpath + ".currentLevel", (v) => {
        tankLevel.innerHTML = Math.floor(v * tankCapacity.innerHTML);
      });
      return(tankCard);
    }

    makeTankGraph(tankpath) {
      let tankGraph = PageUtils.createElement('div', null, 'tank-graph', null, null);
      let tankGraphPercent = PageUtils.createElement('div', null, 'tank-graph-percent', "---", tankGraph);
      //let tankGraphVolume = PageUtils.createElement('div', null, 'tank-graph-volume', "---", tankGraph);
      this.signalkClient.registerCallback(tankpath + ".currentLevel", (v) => {
        var percent = "" + Math.floor(v * 100) + "%";
        tankGraph.style.height = percent;
        tankGraphPercent.innerHTML = percent;
        if (v < 0.1) { tankGraphPercent.classList.add('hidden'); } else { tankGraphPercent.classList.remove('hidden'); }
      });
      return(tankGraph);
    }

    getMeaningfulName(path) {
      var parts = path.split('.');
      var retval = "Tank " + parts[2];
      if (this.options.fluidnames[parts[1]] !== undefined) retval += (" (" + this.options.fluidnames[parts[1]] + ")");
      return(retval);
    }

    
}

const CONFIG = {
  "tweaks": [
    {
      "ignore": true
    },
    {
      "path": "tanks.wasteWater.0",
      "ignore": false,
      "labels": [
        {
          "content": "DISCHARGING",
          "trigger": "electrical.switches.15.1.state"
        }
      ]
    },
    {
      "path": "tanks.freshWater.1",
      "ignore": false,
      "labels": [
        {
          "content": "FILLING",
          "trigger": "tanks.freshWater.1.currentLevel+0.001"
        },
        {
          "content": "EMPTYING",
          "trigger": "tanks.freshWater.1.currentLevel-0.001"
        }
      ]
    },
    {
      "path": "tanks.freshWater.2",
      "ignore": false
    },
    {
      "path": "tanks.fuel.3",
      "ignore": false
    },
    {
      "path": "tanks.fuel.4",
      "ignore": false
    },
    {
      "path": "tanks.fuel",
      "name": "Fuel",
      "color": "red"
    },
    {
      "path": "tanks.freshWater",
      "name": "Water"
    },
    {
      "path": "tanks.wasteWater",
      "name": "Waste"
    }
  ]
}

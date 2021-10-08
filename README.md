# deck-leaflet-layer

deck.gl plugin for Leaflet

fork from https://github.com/zakjan/deck.gl-leaflet


## Install

```
npm install deck-leaflet-layer
```

## Usage

```
import DeckLeafletLayer from 'deck-leaflet-layer';
```

```
const map = L.map(...);
const deckLayer = new DeckLeafletLayer({
  layers: [
    new PolygonLayer({
      data: [...],
    })
  ],
},
  callbacks: {
    onClick: (object) => {

    },
    onHover(object, e) => {

    }
  }
}
map.addLayer(deckLayer);
```
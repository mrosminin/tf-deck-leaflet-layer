# tf-deck-leaflet-layer

deck.gl plugin for Leaflet


## Install

```
npm install tf-deck-leaflet-layer
```

## Usage

```
import DeckLeafletLayer from "tf-deck-leaflet-layer"
```

```
const map = L.map(...)
const deckLayer = new DeckLeafletLayer({
  layers: [
    new ScatterplotLayer({
      data: [...],
    })
  ],
  pane: "paneName"
}, {
  onHover: (object, e) => {...},
  onClick: (object) => {...} 
)

map.addLayer(deckLayer)

```

To update layers

```
deckPathLayer._deck.setProps({
    layers: [layer]
})
```
# tf-deck-leaflet-layer

deck.gl plugin for Leaflet. Fork from deck.gl-leaflet 1.1.2. https://github.com/zakjan/deck.gl-leaflet

## Added

1. А prop "pane" for custom leafletPaneName for the layer
2. Сallbacks onHover and onClick to pickObject

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
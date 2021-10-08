// deck.gl plugin for Leaflet
// fork from https://github.com/zakjan/deck.gl-leaflet

import * as L from "leaflet"
import { Deck } from "@deck.gl/core"

export default class DeckLeafletLayer extends L.Layer {
  /** @type {HTMLElement | undefined} */
  _container = undefined

  /** @type {Deck | undefined} */
  _deck = undefined

  /** @type {boolean | undefined} */
  _animate = undefined

  /**
   * @constructor
   * @param {DeckProps} props
   * @param {Object} callbacks
   */
  constructor(props, callbacks) {
    super()

    this.props = props
    this.callbacks = callbacks
  }

  /**
   * @returns {this}
   */
  onAdd() {
    this._container = L.DomUtil.create("div")
    this._container.className = "leaflet-layer"
    this._container.style.pointerEvents = "none"
    if (this._zoomAnimated) {
      L.DomUtil.addClass(this._container, "leaflet-zoom-animated")
    }

    this.getPane(this.props.pane).appendChild(this._container)
    this._deck = this._createDeckInstance(this._map, this._container, this._deck, this.props)
    this._update()

    return this
  }

  /**
   * @param {L.Map} _map
   * @returns {this}
   */
  onRemove(_map) {
    L.DomUtil.remove(this._container)
    this._container = undefined

    this._deck.finalize()
    this._deck = undefined

    return this
  }

  /**
   * @returns {Object}
   */
  getEvents() {
    const events = {
      viewreset: this._reset,
      movestart: this._onMoveStart,
      moveend: this._onMoveEnd,
      zoomstart: this._onZoomStart,
      zoom: this._onZoom,
      zoomend: this._onZoomEnd,
      click: this._onMouseClick,
      mousemove: this._onMouseMove,
      mouseout: this._onMouseOut
    }
    if (this._zoomAnimated) {
      events.zoomanim = this._onAnimZoom
    }
    return events
  }

  /**
   * @param {DeckProps} props
   * @returns {void}
   */
  setProps(props) {
    Object.assign(this.props, props)

    if (this._deck) {
      this._deck.setProps(props)
    }
  }

  /**
   * @param {Object} callbacks
   * @returns {void}
   */
  setCallbacks(callbacks) {
    Object.assign(this.callbacks, callbacks)
  }

  /**
   * @param {L.Map} map
   * @param {HTMLElement} container
   * @param {Deck} deck
   * @param {DeckProps} props
   * @returns {Deck}
   */
  _createDeckInstance(map, container, deck, props) {
    if (!deck) {
      const viewState = this._getViewState(map)
      deck = new Deck({
        ...props,
        parent: container,
        controller: false,
        viewState
      })
    }
    return deck
  }

  /**
   * @param {L.Map} map
   * @returns {ViewStateProps}
   */
  _getViewState(map) {
    return {
      longitude: map.getCenter().lng,
      latitude: map.getCenter().lat,
      zoom: map.getZoom() - 1,
      pitch: 0,
      bearing: 0
    }
  }

  /**
   * @returns {void}
   */
  _update() {
    if (this._map._animatingZoom) {
      return
    }

    const size = this._map.getSize()
    this._container.style.width = `${size.x}px`
    this._container.style.height = `${size.y}px`

    // invert map position
    const offset = this._map._getMapPanePos().multiplyBy(-1)
    L.DomUtil.setPosition(this._container, offset)

    const viewState = this._getViewState(this._map)

    this._deck.setProps({ viewState })
    this._deck.redraw(false)
  }

  /**
   * @returns {void}
   */
  _pauseAnimation() {
    if (this._deck.props._animate) {
      this._animate = this._deck.props._animate
      this._deck.setProps({ _animate: false })
    }
  }

  /**
   * @returns {void}
   */
  _unpauseAnimation() {
    if (this._animate) {
      this._deck.setProps({ _animate: this._animate })
      this._animate = undefined
    }
  }

  /**
   * @returns {void}
   */
  _reset() {
    this._updateTransform(this._map.getCenter(), this._map.getZoom())
    this._update()
  }

  /**
   * @returns {void}
   */
  _onMoveStart() {
    this._pauseAnimation()
  }

  /**
   * @returns {void}
   */
  _onMoveEnd() {
    this._update()
    this._unpauseAnimation()
  }

  /**
   * @returns {void}
   */
  _onZoomStart() {
    this._pauseAnimation()
  }

  /**
   * @param {L.ZoomAnimEvent} event
   * @returns {void}
   */
  _onAnimZoom(event) {
    this._updateTransform(event.center, event.zoom)
  }

  /**
   * @returns {void}
   */
  _onZoom() {
    this._updateTransform(this._map.getCenter(), this._map.getZoom())
  }

  /**
   * @returns {void}
   */
  _onZoomEnd() {
    this._unpauseAnimation()
  }

  /**
   * see https://stackoverflow.com/a/67107000/1823988
   * see L.Renderer._updateTransform https://github.com/Leaflet/Leaflet/blob/master/src/layer/vector/Renderer.js#L90-L105
   * @param {L.LatLng} center
   * @param {number} zoom
   */
  _updateTransform(center, zoom) {
    const scale = this._map.getZoomScale(zoom, this._map.getZoom())
    const position = L.DomUtil.getPosition(this._container)
    const viewHalf = this._map.getSize().multiplyBy(0.5)
    const currentCenterPoint = this._map.project(this._map.getCenter(), zoom)
    const destCenterPoint = this._map.project(center, zoom)
    const centerOffset = destCenterPoint.subtract(currentCenterPoint)
    const topLeftOffset = viewHalf.multiplyBy(-scale).add(position).add(viewHalf).subtract(centerOffset)

    if (L.Browser.any3d) {
      L.DomUtil.setTransform(this._container, topLeftOffset, scale)
    } else {
      L.DomUtil.setPosition(this._container, topLeftOffset)
    }
  }

  /**
   * calls callbacks.onClick(object)
   * @param {L.MouseEvent} e
   * @returns {void}
   */
  _onMouseClick(e) {
    if (!this.callbacks.hasOwnProperty("onClick")) {
      return
    }
    let dObject = this._deck.pickObject({
      x: e.containerPoint.x,
      y: e.containerPoint.y
    })
    if (dObject && dObject.object) {
      this.callbacks.onClick(dObject.object)
    }
  }

  /**
   * calls callbacks.onHover(object, e)
   * @param {L.MouseEvent} e
   * @returns {void}
   */
  _onMouseMove(e) {
    if (!this.callbacks.hasOwnProperty("onHover")) {
      return
    }
    let dObject = this._deck.pickObject({
      x: e.containerPoint.x,
      y: e.containerPoint.y
    })
    this.callbacks.onHover(dObject ? dObject.object : null, e)
  }

  /**
   * calls callbacks.onHover(null)
   * @returns {void}
   */
  _onMouseOut() {
    if (!this.callbacks.hasOwnProperty("onHover")) {
      return
    }
    this.callbacks.onHover(null)
  }
}

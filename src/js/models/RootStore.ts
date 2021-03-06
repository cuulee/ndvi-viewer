import { observable, computed } from 'mobx'
import * as _ from 'lodash'
import constants, { Modes } from '@app/constants'
import Point from '@app/models/Point'
import BoundingBox from '@app/models/BoundingBox'
import Camera from '@app/models/Camera'
import VectorLayer from '@app/models/VectorLayer'
import Atlas from '@app/models/Atlas'

class RootStore {
  @observable initialized: boolean = false
  @observable compatible: boolean = true
  @observable menuOpen: boolean = false
  @observable moreInfoOpen: boolean = false

  @observable camera: Camera
  @observable vectorLayer: VectorLayer
  @observable ndviAtlas: Atlas
  @observable ndviAnomalyAtlas: Atlas
  @observable boundingBox = observable<BoundingBox>(new BoundingBox())
  @observable mode: Modes = Modes.NDVI

  @observable timePeriod: number = constants.START_TIME_PERIOD

  @computed get atlas () {
    switch (this.mode) {
      case Modes.NDVI:
      case Modes.NDVI_GROUPED:
        return this.ndviAtlas
        break
      case Modes.NDVI_ANOMALY:
      case Modes.NDVI_ANOMALY_GROUPED:
        return this.ndviAnomalyAtlas
        break
    }
  }

  @computed get modeConfig () {
    return constants.MODE_CONFIGS[this.mode]
  }

  @computed get numTimePeriods () {
    return this.atlas.config.numRasters
  }

  readonly timePeriodAverages = observable<number>([])

  @computed get timePeriodsByMonth () {
    return _.times(this.numTimePeriods, (i) => {
      const n = this.numTimePeriods
      const id = ((i * 12) % n) + Math.floor((i * 12) / n)

      return {
        id,
        average: this.timePeriodAverages[id],
      }
    })
  }

  @computed get percentLoaded () {
    return (
      (this.ndviAtlas ? this.ndviAtlas.loadProgress : 0) +
      (this.ndviAnomalyAtlas ? this.ndviAnomalyAtlas.loadProgress : 0)
    ) / 2
  }

  @computed get rasterWidth () {
    return this.atlas.config.rasterWidth
  }

  @computed get rasterHeight () {
    return this.atlas.config.rasterHeight
  }

  @computed get rasterSizePercent () {
    return new Point(
      1 / this.atlas.config.rastersWide,
      1 / this.atlas.config.rastersHigh
    )
  }

  @computed get textureRastersWide () {
    return this.atlas.config.rastersWide
  }

  @computed get textureRastersHigh () {
    return this.atlas.config.rastersHigh
  }

  @computed get samplesWide () {
    return this.textureRastersWide * 4
  }

  async initialize () {
    this.vectorLayer = new VectorLayer()
    await this.vectorLayer.initialize(constants.VECTOR_URL)

    this.ndviAtlas = new Atlas()
    this.ndviAnomalyAtlas = new Atlas()

    await Promise.all([
      this.ndviAtlas.initialize({
        url: constants.MODE_CONFIGS[Modes.NDVI].ATLAS,
        configUrl: constants.MODE_CONFIGS[Modes.NDVI].ATLAS_CONFIG,
      }),
      this.ndviAnomalyAtlas.initialize({
        url: constants.MODE_CONFIGS[Modes.NDVI_ANOMALY].ATLAS,
        configUrl: constants.MODE_CONFIGS[Modes.NDVI_ANOMALY].ATLAS_CONFIG,
      }),
    ])

    this.boundingBox = observable(BoundingBox.fromArray(
      this.atlas.config.boundingBox
    ))

    const startingBox = this.boundingBox.square.lngLatFromSinusoidal.scaled(1.1)

    this.camera = new Camera({
      size: new Point(100, 100),
      boundingBox: BoundingBox.fromArray(startingBox.array),
    })

    this.initialized = true
  }

  @computed get selectedBox (): BoundingBox {
    const size = this.camera.size
    const center = new Point(size.x / 2, size.y / 2)
    const extent = Math.min(size.x, size.y) / 2 -
      constants.SELECTED_BOX_PADDING

    const minPixel = new Point(center.x - extent, center.y + extent)
    const maxPixel = new Point(center.x + extent, center.y - extent)

    return new BoundingBox({
      min: this.camera.pixelToLngLat(minPixel),
      max: this.camera.pixelToLngLat(maxPixel),
    })
  }
}

export default RootStore

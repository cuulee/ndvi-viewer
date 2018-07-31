import * as React from 'react'
import { inject, observer } from 'mobx-react'
import constants from '@app/constants'
import { format } from 'd3'
import * as _ from 'lodash'
import { translate } from '@app/utils'

const YAxis = ({ xScale, yScale, colorScale }: {
  xScale: any,
  yScale: any,
  colorScale: any,
}) => {
  const leftScaleWidth = 7
  const numStops = 10
  const stops = _.times(numStops, i => ({
    color: colorScale((i / (numStops - 1)) * 1.2 - 0.2),
    percent: i / (numStops - 1) * 100,
  }))

  const formatter = format('.1f')

  return (
    <g className='axis y-axis'>
      <defs>
        <linearGradient id='grad1' x1='0%' y1='100%' x2='0%' y2='0%'>
          {
            stops.map(stop => (
              <stop key={stop.percent}
                offset={`${stop.percent}%`}
                style={{
                  stopColor: stop.color,
                  stopOpacity: 1,
                }} />
            ))
          }
        </linearGradient>
      </defs>
      <g transform={translate(xScale.range()[0] - 46, 0)}>
        <g transform={translate(0, yScale(1))} className='tick y-tick'>
          <line x1='0' y1='0.5' x2='32' y2='0.5' />
        </g>
        <image href='/img/ndvi-high.svg'
          width='30' height='30'
          x='0' y={yScale(0.8) - 15} />
        <g transform={translate(0, yScale(0.6))} className='tick y-tick'>
          <line x1='0' y1='0.5' x2='32' y2='0.5' />
        </g>
        <image href='/img/ndvi-medium.svg'
          width='30' height='30'
          x='0' y={yScale(0.4) - 15} />
        <g transform={translate(0, yScale(0.2))} className='tick y-tick'>
          <line x1='0' y1='0.5' x2='32' y2='0.5' />
        </g>
        <image href='/img/ndvi-low.svg'
          width='30' height='30'
          x='0' y={yScale(0) - 15} />
        <g transform={translate(0, yScale(-0.2))} className='tick y-tick'>
          <line x1='0' y1='0.5' x2='32' y2='0.5' />
        </g>
      </g>
      <rect x={xScale.range()[0] - leftScaleWidth}
        y={yScale.range()[1]}
        width={leftScaleWidth}
        height={yScale.range()[0] - yScale.range()[1]}
        fill='url(#grad1)' />
      {
        constants.DATA_Y_TICKS.map((tick, i) => (
          <g key={i} className='tick y-tick'
            transform={translate(
              xScale.range()[0] - leftScaleWidth,
              yScale.range()[0] -
              (i / (constants.DATA_Y_TICKS.length - 1)) *
              (yScale.range()[0] - yScale.range()[1]),
            )}>
            <text dy='6' x='-43' y='0'>{formatter(tick)}</text>
            <line x1={-leftScaleWidth} y1='0.5'
              x2={(xScale.range()[1] - xScale.range()[0]) + leftScaleWidth}
              y2='0.5' />
          </g>
        ))
      }
    </g>
  )
}

export default inject('rootStore')(observer(YAxis))

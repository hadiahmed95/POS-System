import React, { SVGAttributes } from 'react'

interface IRingCircle extends SVGAttributes<HTMLOrSVGElement> {
  className?: string
}


const RingCircle = ({className, ...rest}: IRingCircle) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className={`w-20 h-20 ${className}`}
    {...rest}
    >
      <circle fill="none" strokeOpacity="1" stroke="currentColor" strokeWidth=".5" cx="100" cy="100" r="0"><animate attributeName="r" calcMode="spline" dur="2" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="2" values="0;25" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="2" values="1;0" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></circle>
    </svg>
  )
}

export default RingCircle
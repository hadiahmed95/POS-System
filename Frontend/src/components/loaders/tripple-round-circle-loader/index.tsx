import React from 'react'
import style from "./tripple-round-circle-loader.module.scss"

const TrippleRoundCircleLoader = () => {
  return (
    // <div className={`${style.circleloading} w-3`}></div>
    <div className={`${style.circleloading} relative h-[50px]`}>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
  <span></span>
</div>
  )
}

export default TrippleRoundCircleLoader
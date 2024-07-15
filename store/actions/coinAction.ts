import { NEAR_STATUS, DUST_STATUS } from '../types'
// import { Dispatch, AnyAction } from "redux"

export const setCoinData = (action: string, data, dispatch) => {
  // console.log("dispatch", action, data)
  try {
    switch (action) {
      case NEAR_STATUS:
        dispatch({
          type: action,
          payload: data,
        })
        break
      case DUST_STATUS:
        dispatch({
          type: action,
          payload: data,
        })
        break
    }
  } catch (error) {
    console.log(error)
  }
}

import { NEAR_STATUS } from '../types'

const initialState = {
  near_value: 0,
}

const coinReducer = (state = initialState, action) => {
  switch (action.type) {
    case NEAR_STATUS:
      return {
        ...state,
        near_value: action.payload,
      }
    default:
      return state
  }
}

export default coinReducer

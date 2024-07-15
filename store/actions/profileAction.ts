import { PROFILE_STATUS } from '../types'
import { Dispatch, AnyAction } from 'redux'

export const setProfileData = (action: string, data) => async (dispatch) => {
  try {
    switch (action) {
      case PROFILE_STATUS:
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

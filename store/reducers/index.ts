import { combineReducers } from 'redux'
import uiReducer from './uiReducer'
import filterReducer from './filterReducer'
import profileReducer from './profileReducer'
import coinReducer from './coinReducer'

const allReducers = combineReducers({
  uiData: uiReducer,
  filterData: filterReducer,
  profileData: profileReducer,
  coinData: coinReducer,
})
export default allReducers
export type State = ReturnType<typeof allReducers>

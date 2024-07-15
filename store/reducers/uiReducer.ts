import {
  NFT_COLUMN_COUNT,
  UI_ERROR,
  TOKEN_IN_USD,
  USDN_IN_HERA,
} from '../types'

const initialState = {
  nft_column_count: 4,
  token_value: {},
}

const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case NFT_COLUMN_COUNT:
      return {
        ...state,
        nft_column_count: action.payload,
      }

    case UI_ERROR:
      return {
        nft_column_count: 4,
        error: action.payload,
      }
    case TOKEN_IN_USD:
      return {
        ...state,
        token_value: action.payload,
      }
    case USDN_IN_HERA:
      state.token_value['usdn.testnet'] =
        action.payload * state.token_value['hera.cmdev0.testnet']
      return state
    default:
      return state
  }
}

export default uiReducer

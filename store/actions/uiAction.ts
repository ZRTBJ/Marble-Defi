import { Dispatch, AnyAction } from 'redux'
import {
  NFT_COLUMN_COUNT,
  UI_ERROR,
  TOKEN_IN_USD,
  USDN_IN_HERA,
} from '../types'
import { getPoolLiquidity } from 'hooks/usePoolLiquidity'

const PoolIds = [3, 4, 5]
const Pools = [
  {
    decimals: 24,
    tokenAddress: ['dust.cmdev0.testnet', 'wrap.testnet'],
    poolId: 3,
  },
  {
    decimals: 24,
    tokenAddress: ['hera.cmdev0.testnet', 'wrap.testnet'],
    poolId: 4,
  },
  {
    decimals: 24,
    tokenAddress: ['test.cmdev0.testnet', 'wrap.testnet'],
    poolId: 5,
  },
  {
    decimals: 24,
    tokenAddress: ['hera.cmdev0.testnet', 'usdn.testnet'],
    poolId: 6,
  },
]
export const setUIData =
  (action: string, data: number) => async (dispatch: Dispatch<AnyAction>) => {
    try {
      switch (action) {
        case NFT_COLUMN_COUNT:
          dispatch({
            type: action,
            payload: data,
          })
          break
      }
    } catch (error) {
      dispatch({
        type: UI_ERROR,
        payload: 'error message',
      })
    }
  }

export const getTokenPriceInUsd = (dispatch: Dispatch<AnyAction>) => {
  Promise.all(
    Pools.map((value) => {
      return getPoolLiquidity({ ...value, coinPrice: {} })
    })
  )
    .then((value) => {
      let tokenValue = {}
      value.forEach((data) => {
        if (data.liquidity.pool_id === 6) {
          tokenValue[data.liquidity.tokens[1]] =
            (data.liquidity.reserve[0] / data.liquidity.reserve[1]) *
            tokenValue[data.liquidity.tokens[0]]
        }
        tokenValue[data.liquidity.tokens[0]] =
          data.liquidity.reserve[1] / data.liquidity.reserve[0]
      })
      dispatch({
        type: TOKEN_IN_USD,
        payload: { ...tokenValue, 'wrap.testnet': 1 },
      })
    })
    .catch((err) => {
      console.log('catchError: ', err)
      dispatch({
        type: TOKEN_IN_USD,
        payload: {},
      })
    })
}

import { useMemo, useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTokenList } from 'hooks/useTokenList'
import {
  getMultiplePoolsLiquidity,
  LiquidityInfoType,
  LiquidityReturnType,
} from 'hooks/usePoolLiquidity'
import {
  FarmInfo,
  getFarms,
  getRewards,
  getSeeds,
  getStakedListByAccountId,
} from 'util/farm'
import { DEFAULT_PAGE_LIMIT } from 'util/pool'
import db from 'store/RefDatabase'

const page = 1
const perPage = DEFAULT_PAGE_LIMIT
export const useDb = () => {
  const [loading, setLoading] = useState(true)
  const [tokenList] = useTokenList()
  const [liquidity, setLiquidity] = useState<LiquidityInfoType[]>()
  const coinPrice = useSelector((state: any) => state.uiData.token_value)
  const nearValue = useSelector((state: any) => state.coinData.near_value)
  const [supportedTokens, pools] = useMemo(() => {
    const safePoolList = tokenList?.pools || []

    const poolIdsCollection = safePoolList
      .map(({ pool_id, token_address, decimals }) => {
        return { pool_id, token_address, decimals }
      })
      .filter(({ pool_id }) => {
        return !isNaN(pool_id)
      })

    return [tokenList, poolIdsCollection]
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [tokenList?.pools, coinPrice])
  const rewardToken = 'dust.cmdev0.testnet'
  // Todo: Change this to Dust vaule
  useEffect(() => {
    // eslint-disable-line react-hooks/rules-of-hooks
    getMultiplePoolsLiquidity({
      pools,
      coinPrice,
    }).then(({ liquidity }: LiquidityReturnType) => {
      setLiquidity(liquidity)
      if (liquidity.length > 0) loadFarmInfoList(liquidity, tokenList?.pools)
    })
  }, [pools, coinPrice])

  const loadFarmInfoList = async (liquidity, pools) => {
    let Params: [
      Promise<Record<string, string>>,
      Promise<Record<string, string>>,
      Promise<Record<string, string>>,
      Promise<string>
    ]
    Params = [
      getStakedListByAccountId({}),
      getRewards({}),
      getSeeds({}),
      nearValue.toString(),
    ]

    const resolvedParams: [
      Record<string, string>,
      Record<string, string>,
      Record<string, string>,
      string
    ] = await Promise.all(Params)

    const stakedList: Record<string, string> = resolvedParams[0]
    const rewardList: any = resolvedParams[1]
    const seeds: Record<string, string> = resolvedParams[2]
    const tokenPrice: string = resolvedParams[3]
    const tokenPriceList = {
      // Todo: this needs to be changed to dust
      [rewardToken]: {
        price: tokenPrice,
      },
    }
    const farms = await getFarms({
      page,
      perPage,
      stakedList,
      rewardList,
      tokenPriceList,
      seeds,
      liquidity,
      pools,
    })
    await db.cacheFarms(farms)
    setLoading(false)
  }
  return loading
}

import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
// import { styled } from 'components/theme'
import { AppLayout } from 'components/Layout/AppLayout'
import { Spinner } from 'components/Spinner'
import { Text } from 'components/Text'
import { PoolCard } from 'features/liquidity/components/PoolCard'
import { RewardCard } from 'features/liquidity/components/RewardCard'
import {
  getMultiplePoolsLiquidity,
  LiquidityInfoType,
  LiquidityReturnType,
} from 'hooks/usePoolLiquidity'
import {
  unsafelyGetTokenInfoFromAddress,
  useBaseTokenInfo,
} from 'hooks/useTokenInfo'
import { useTokenList } from 'hooks/useTokenList'
import db from 'store/RefDatabase'
import {
  FarmInfo,
  getFarms,
  getRewards,
  getSeeds,
  getStakedListByAccountId,
} from 'util/farm'
import { DEFAULT_PAGE_LIMIT } from 'util/pool'
import { useSelector } from 'react-redux'
import { isMobile } from 'util/device'

export default function Pools() {
  const [tokenList] = useTokenList()
  const [accountId, setAccountId] = useState('')
  const [isLoading, setIsloading] = useState(false)
  const [liquidity, setLiquidity] = useState<LiquidityInfoType[]>()
  // const [stakeList, setStakeList] = useState<Record<string, string>>()
  // const [dustPrice, setDustPrice] = useState<Number>(0)
  const [tokenPriceList, setTokenPriceList] = useState<Record<string, any>>()
  const [stakedList, setStakedList] = useState<Record<string, string>>({})
  const [rewardList, setRewardList] = useState<Record<string, string>>({})
  const [seeds, setSeeds] = useState<Record<string, string>>({})
  const [farms, setFarms] = useState<FarmInfo[]>()
  const nearValue = useSelector((state: any) => state.coinData.near_value)
  const coinPrice = useSelector((state: any) => state.uiData.token_value)
  const page = 1
  const perPage = DEFAULT_PAGE_LIMIT
  const rewardToken = 'dust.cmdev0.testnet'
  useEffect(() => {
    setAccountId(localStorage.getItem('accountId'))
    // useNearDollarValue().then(res => {
    //   setDustPrice(res)
    //   setTokenPriceList({
    //     hera: res.toString()
    //   })
    // })
  }, [])
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
  }, [tokenList?.pools])

  // Todo: Change this to Dust vaule
  useEffect(() => {
    setIsloading(true)
    // eslint-disable-line react-hooks/rules-of-hooks
    getMultiplePoolsLiquidity({
      pools,
      coinPrice,
    }).then(({ liquidity }: LiquidityReturnType) => {
      setLiquidity(liquidity)
      if (liquidity.length > 0) loadFarmInfoList(liquidity, tokenList?.pools)
      setIsloading(false)
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
    setStakedList(stakedList)
    setRewardList(rewardList)
    setSeeds(seeds)
    setTokenPriceList(tokenPriceList)

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
    setFarms(farms)
    await db.cacheFarms(farms)
    const farmsCahced = await db.queryFarms()
  }
  const [myPools, allPools] = useMemo(() => {
    if (!liquidity?.length) return []
    const pools = [[], []]
    liquidity.forEach((liquidityInfo, index) => {
      console.log('liquidityInfo: ', liquidityInfo)
      const poolIndex =
        liquidityInfo.myLiquidity.coins > 0 ||
        Number(farms && farms[index].userStaked) > 0
          ? 0
          : 1
      pools[poolIndex].push({
        poolId: tokenList?.pools[index]?.pool_id,
        farmInfo: farms ? farms[index] : {},
        liquidityInfo,
        tokenInfo: [
          unsafelyGetTokenInfoFromAddress(liquidityInfo.tokens[0]),
          unsafelyGetTokenInfoFromAddress(liquidityInfo.tokens[1]),
        ],
      })
    })

    return pools
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [liquidity, accountId, farms, supportedTokens])
  const { symbol: baseTokenSymbol } = useBaseTokenInfo() || {}
  const shouldShowFetchingState = isLoading || !liquidity?.length
  const shouldRenderPools = !isLoading && Boolean(liquidity?.length)

  return (
    <AppLayout>
      <Container>
        <Header>
          <h1>{!isMobile() && 'Available '}Pools</h1>
          <p>
            Provide liquidity to the market and receive swap fees from each
            trade.
          </p>
        </Header>
        <StyledDivForWrapper>
          {shouldShowFetchingState && (
            <>
              <StyledDivForFullSpace>
                <Spinner size={32} color="black" />
              </StyledDivForFullSpace>
            </>
          )}

          {shouldRenderPools && (
            <>
              <RewardCard />
              {Boolean(myPools?.length) && (
                <>
                  <SectionTitle>My Pools</SectionTitle>
                  <StyledDivForPoolsGrid className="pool-list">
                    {myPools.map(
                      ({ liquidityInfo, farmInfo, tokenInfo, poolId }, key) => {
                        return (
                          <PoolCard
                            key={key}
                            tokenA={tokenInfo[0]}
                            poolId={poolId}
                            tokenB={tokenInfo[1]}
                            farmInfo={farmInfo}
                            myLiquidity={liquidityInfo.myLiquidity}
                            tokenDollarValue={liquidityInfo.tokenDollarValue}
                            totalLiquidity={liquidityInfo.totalLiquidity}
                          />
                        )
                      }
                    )}
                  </StyledDivForPoolsGrid>
                  {Boolean(allPools?.length) && (
                    <SectionTitle variant="all">All pools</SectionTitle>
                  )}
                </>
              )}
              <StyledDivForPoolsGrid className="pool-list">
                {allPools?.map(
                  ({ liquidityInfo, farmInfo, tokenInfo, poolId }, key) => {
                    return (
                      <PoolCard
                        key={key}
                        tokenA={tokenInfo[0]}
                        poolId={poolId}
                        tokenB={tokenInfo[1]}
                        myLiquidity={liquidityInfo.myLiquidity}
                        farmInfo={farmInfo}
                        tokenDollarValue={liquidityInfo.tokenDollarValue}
                        totalLiquidity={liquidityInfo.totalLiquidity}
                      />
                    )
                  }
                )}
              </StyledDivForPoolsGrid>
            </>
          )}
        </StyledDivForWrapper>
      </Container>
    </AppLayout>
  )
}

const Container = styled.div`
  padding: 20px 60px;
  height: 100%;
  position: relative;
  @media (max-width: 1550px) {
    padding: 20px;
  }
`

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    font-size: 45px;
    font-weight: 700;
    font-family: Trajan;
  }
  p {
    font-size: 24px;
    font-weight: 400;
    font-family: Trajan;
  }
  @media (max-width: 1550px) {
    margin-bottom: 0px;
    p {
      font-size: 14px;
    }
  }
  @media (max-width: 650px) {
    h1 {
      font-size: 35px;
      font-weight: 700;
      font-family: Trajan;
    }
    p {
      font-size: 18px;
      font-weight: 400;
      font-family: Trajan;
    }
  }
`
const StyledDivForFullSpace = styled.div`
  padding-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
`

const StyledDivForPoolsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 20px;
  row-gap: 20px;
  @media (max-width: 1550px) {
    column-gap: 15px;
    row-gap: 15px;
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
  }
  @media (max-width: 650px) {
    grid-template-columns: 1fr;
  }
`

const SectionTitle = ({ variant = 'my', children }) => {
  return (
    <Text
      variant="primary"
      css={{
        fontWeight: '$bold',
        fontFamily: 'Trajan',
        color: '#FFFFFF',
        fontSize: '$fontSizes$9',
        paddingBottom: '20px',
        paddingTop: variant === 'all' ? '$19' : '10px',
      }}
    >
      {children}
    </Text>
  )
}
const StyledDivForWrapper = styled.div`
  overflow: auto;
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  padding: 0 10px;
`

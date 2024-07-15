import { useEffect, useState, useMemo } from 'react'
import styled from 'styled-components'
import { Stack, HStack } from '@chakra-ui/react'
import { LiquidityInfoType, LiquidityReturnType } from 'hooks/usePoolLiquidity'
import { Staked, Reward, Bonded, APR } from 'icons'
import { useTokenList } from 'hooks/useTokenList'
import { getMultiplePoolsLiquidity } from 'hooks/usePoolLiquidity'
import StyledCard from './components/StateCard'
import {
  getFarms,
  getSeeds,
  getStakedListByAccountId,
  getRewards,
  FarmInfo,
} from 'util/farm'
import { DEFAULT_PAGE_LIMIT } from 'util/pool'
import db from 'store/RefDatabase'
import DepositCard from './components/DepositCard'
import { useSelector } from 'react-redux'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'

const page = 1
const perPage = DEFAULT_PAGE_LIMIT

export const Dashboard = () => {
  const [tokenList] = useTokenList()
  const [isLoading, setIsloading] = useState(false)
  const [liquidity, setLiquidity] = useState<LiquidityInfoType[]>()
  const coinPrice = useSelector((state: any) => state.uiData.token_value)
  const [farms, setFarms] = useState<FarmInfo[]>()
  const rewardToken = 'dust.cmdev0.testnet'
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
  const getNearDollarValue = async () => {
    return '4.5405'
  }
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
      getNearDollarValue(),
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
    setFarms(farms)
    await db.cacheFarms(farms)
    const farmsCahced = await db.queryFarms()
  }
  const getTVL = () => {
    let tvl = 0
    if (!farms) return '0'
    farms.forEach((farm) => {
      if (!farm) return
      tvl += farm.pool.tvl
    })
    return tvl.toLocaleString()
  }
  return (
    <StyledDivForWrapper>
      <StyldedGrid>
        <StyledCard
          color="#99E39E"
          icon={<Staked />}
          title={
            <CTitle>
              Staked
              <br />
              Marble
            </CTitle>
          }
          value={<CValue>51.76%</CValue>}
        />
        <StyledCard
          color="#FE9A45"
          icon={<Bonded />}
          title={
            <CTitle>
              Bonded Liquidity
              <br />
              Ratio
            </CTitle>
          }
          value={<CValue>59.86%</CValue>}
        />
        <StyledCard
          color="#B0954A"
          icon={<Reward />}
          title={
            <CTitle>
              Daily Dao Staking
              <br />
              Reward
            </CTitle>
          }
          value={<CValue>136986.3</CValue>}
        />
        <StyledCard
          color="#FF5368"
          icon={<APR />}
          title={
            <CTitle>
              Liquidity Staking
              <br />
              APR
            </CTitle>
          }
          value={<CValue>260.41%</CValue>}
        />
      </StyldedGrid>
      <Value style={{ fontFamily: 'Trajan' }}>Protocol Stats</Value>
      <StateContent>
        <StateElement>
          <Title>Liquidity Pools</Title>
          <Value>${getTVL()}</Value>
        </StateElement>
        <StateElement>
          <Title>Bonded Liquidity</Title>
          <Value>$61,971.74</Value>
        </StateElement>
        <StateElement>
          <Title>Staked Marble</Title>
          <Value>$61,971.74</Value>
        </StateElement>
        <StateElement>
          <Title>Treasury</Title>
          <Value>$61,971.74</Value>
        </StateElement>
      </StateContent>
      {farms && (
        <DepositCardWrapper>
          <DepositCard param={farms[1]} />
          <DepositCard param={farms[2]} />
        </DepositCardWrapper>
      )}
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled.div`
  padding: 0 0px;
  position: relative;
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  @media (max-width: 1550px) {
    padding: 20px;
    row-gap: 15px;
  }
  @media (max-width: 1024px) {
    padding: 0px;
  }
`
const StyldedGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-column-gap: 30px;
  @media (max-width: 1550px) {
    grid-column-gap: 15px;
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr;
    row-gap: 15px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`
const Title = styled.div`
  font-size: 16px;
  color: #a1a1a1;
  font-weight: 500;
  font-family: Trajan;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`

const Value = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: white;
  @media (max-width: 1550px) {
    font-size: 16px;
  }
`
const CTitle = styled.div`
  font-size: 15px;
  color: #a1a1a1;
  font-weight: 500;
  font-family: Trajan;
  @media (max-width: 1550px) {
    font-size: 12px;
  }
`

const CValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: white;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`
const StateContent = styled(GradientBackground)`
  padding: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  @media (max-width: 1550px) {
    padding: 12px;
  }
  @media (max-width: 850px) {
    grid-template-columns: 1fr 1fr;
    row-gap: 20px;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
  &:before {
    border-radius: 20px;
  }
`
const StateElement = styled.div`
  text-align: center;
  @media (max-width: 480px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`
const DepositCardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 30px;
  @media (max-width: 850px) {
    grid-template-columns: 1fr;
    row-gap: 30px;
  }
`

import React, { useEffect, useMemo, useState } from 'react'
import { styled } from 'components/theme'
import Head from 'next/head'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { AppLayout } from 'components/Layout/AppLayout'
import { Text } from 'components/Text'
import { Chevron } from 'icons/Chevron'
import { IconWrapper } from 'components/IconWrapper'
import {
  PoolBondedLiquidityCard,
  UnbondingLiquidityCard,
  ManagePoolDialog,
  PoolAvailableLiquidityCard,
  BondLiquidityDialog,
} from 'features/liquidity'
import { ChakraProvider, Text as ChakraText, Stack } from '@chakra-ui/react'
import { unsafelyGetTokenInfoFromAddress } from 'hooks/useTokenInfo'
import { getPoolLiquidity, LiquidityType } from 'hooks/usePoolLiquidity'
import { parseCurrency } from 'features/liquidity/components/PoolCard'
import { __POOL_REWARDS_ENABLED__, APP_NAME } from 'util/constants'
import { Spinner } from 'components/Spinner'
import { protectAgainstNaN } from 'util/conversion'
import { TokenInfo } from 'hooks/useTokenList'
import { usePoolList } from 'hooks/usePoolList'
import { PoolInfo } from 'features/liquidity/components/PoolInfo'
import { stake, unstakeRequest, unstake } from 'util/m-token'
import db, { FarmDexie } from 'store/RefDatabase'
import { useDb } from 'hooks/useDb'
import { displayApr } from 'features/liquidity/components/PoolCard'
import { getUnbondListByAccountId, claimRewardByFarm } from 'util/farm'
import { getCurrentWallet } from 'util/sender-wallet'
import {
  ContentWrapper,
  Container,
  StyledWrapperForNavigation,
} from 'components/poolsStyle'
import { GradientBackground } from 'styles/styles'
// import { checkTransaction } from 'util/near'
// import { getURLInfo } from 'components/transactionTipPopUp'

export default function Pool() {
  const {
    query: { pool },
  } = useRouter()
  const isReady = useDb()
  const { accountId } = getCurrentWallet()
  // const { txHash, pathname, errorType } = getURLInfo()
  const [isManageLiquidityDialogShowing, setIsManageLiquidityDialogShowing] =
    useState(false)
  const [isBondingDialogShowing, setIsBondingDialogShowing] = useState(false)
  const [totalLiquidity, setTotalLiquidity] = useState<LiquidityType>({
    coins: 0,
    dollarValue: 0,
  })
  const [myLiquidity, setMyLiquidity] = useState<LiquidityType>({
    coins: 0,
    dollarValue: 0,
  })
  const [tokenDollarValue, setTokenDollarValue] = useState(0)
  const [myReserve, setMyReserve] = useState<[number, number]>([0, 0])
  const [reserve, setReserve] = useState<[number, number]>([0, 0])
  const [isLoading, setIsLoading] = useState(false)
  const [tokenPrice, setTokenPrice] = useState(0)
  const [tokenA, setTokenA] = useState<TokenInfo>()
  const [tokenB, setTokenB] = useState<TokenInfo>()
  const [poolList] = usePoolList()
  const [pool_id, setPoolId] = useState(0)
  const [pool_name, setPoolName] = useState('')
  const [decimals, setDecimals] = useState(24)
  const [farmInfo, setFarmInfo] = useState<FarmDexie>()
  const [unbondings, setUnbondings] = useState<[number, number][]>([])
  const coinPrice = useSelector((state: any) => state.uiData.token_value)
  useEffect(() => {
    if (tokenA && tokenB) initialSet()
    if (!isNaN(Number(pool)) && poolList) {
      const poolById = poolList?.find((p) => p?.pool_id === Number(pool))
      // console.log('poolList: ', poolList, poolById, pool)
      if (!poolById) return
      setPoolId(poolById?.pool_id)
      setPoolName(poolById?.name)
      setDecimals(poolById?.decimals)
      const tokenA = unsafelyGetTokenInfoFromAddress(poolById?.token_address[0])
      const tokenB = unsafelyGetTokenInfoFromAddress(poolById?.token_address[1])
      setTokenA(tokenA)
      setTokenB(tokenB)
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [pool, poolList, tokenA, tokenB, coinPrice])
  useEffect(() => {
    if (!isNaN(Number(pool))) {
      if (!accountId) return
      db.queryFarms().then((farms) => {
        const index = farms.map((r) => Number(r.pool_id)).indexOf(Number(pool))
        const farmInfo = farms[index]
        setFarmInfo(farmInfo)
        getUnbondListByAccountId({
          accountId: accountId,
          seedId: farmInfo?.seed_id,
        })
          .then((res) => {
            setUnbondings(res)
          })
          .catch((err) => console.log('Unbonding err: ', err))
      })
    }
  }, [pool, accountId, isReady])
  const initialSet = () => {
    setIsLoading(true)
    // eslint-disable-line react-hooks/rules-of-hooks
    getPoolLiquidity({
      poolId: Number(pool),
      tokenAddress: [tokenA?.token_address, tokenB?.token_address],
      decimals,
      coinPrice,
    })
      .then(({ liquidity }) => {
        setTotalLiquidity(liquidity.totalLiquidity)
        setMyLiquidity(liquidity.myLiquidity)
        setTokenDollarValue(liquidity.tokenDollarValue)
        setMyReserve(liquidity.myReserve)
        setReserve(liquidity.reserve)
        setIsLoading(false)
        setTokenPrice(
          protectAgainstNaN(liquidity.reserve[1] / liquidity.reserve[0])
        )
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
      })
  }

  const isLoadingInitial = !totalLiquidity || (!totalLiquidity && isLoading)

  const onSubmit = ({ type, amount, isFull = false }) => {
    const poolById = poolList?.find((p) => p?.pool_id === Number(pool))
    if (type === 'bond') {
      stake({
        token_id: poolById.token_id,
        poolId: poolById.pool_id.toString(),
        amount: amount.toString(),
        isFull,
      })
    } else {
      unstakeRequest({
        seed_id: farmInfo?.seed_id,
        poolId: poolById.pool_id.toString(),
        amount: amount.toString(),
      })
    }
  }

  const onWithdraw = (index) => {
    unstake({ seed_id: farmInfo?.seed_id, farm_id: farmInfo?.id, id: index })
  }

  const onClaim = () => {
    claimRewardByFarm(farmInfo?.id)
  }
  if (!tokenA || !tokenB || !pool) {
    return null
  }
  return (
    <ChakraProvider>
      {pool && (
        <ManagePoolDialog
          isShowing={isManageLiquidityDialogShowing}
          onRequestClose={() => setIsManageLiquidityDialogShowing(false)}
          poolInfo={{
            poolId: pool.toString(),
            reserve,
            myReserve,
            myLiquidity,
            totalLiquidity,
          }}
        />
      )}
      {__POOL_REWARDS_ENABLED__ && (
        <BondLiquidityDialog
          isShowing={isBondingDialogShowing}
          lpTokenAmount={myLiquidity.coins}
          bonded={farmInfo?.userStaked}
          onRequestClose={() => setIsBondingDialogShowing(false)}
          onSubmit={onSubmit}
          poolId={pool}
        />
      )}

      {pool && (
        <Head>
          <title>
            {APP_NAME} — Pool {pool_name}
          </title>
        </Head>
      )}

      <AppLayout>
        <Container>
          <StyledWrapperForNavigation>
            <StyledNavElement position="left">
              <Link href="/pools" passHref>
                <IconWrapper
                  as="a"
                  type="button"
                  size="20px"
                  icon={<Chevron />}
                />
              </Link>
            </StyledNavElement>
            <StyledNavElement position="center">
              <Header>{pool_name}</Header>
            </StyledNavElement>
          </StyledWrapperForNavigation>
          <ContentWrapper>
            <Stack>
              <PoolInfo
                poolId={pool as string}
                onClaim={onClaim}
                tokenDollarValue={tokenDollarValue}
                reward_interval={farmInfo?.session_interval}
                start_at={farmInfo?.start_at}
                myDailyReward={farmInfo?.userUnclaimedReward}
              />
            </Stack>

            {isLoadingInitial && (
              <StyledDivForSpinner>
                <Spinner color="black" size={32} />
              </StyledDivForSpinner>
            )}
            {!isLoadingInitial && (
              <Stack spacing="10px">
                <LiquidityInfoWrapper>
                  <StyledRowForTokensInfo
                    kind="wrapper"
                    className="pool-wrapper"
                  >
                    <StyledRowForTokensInfo kind="column">
                      <PoolTitle>Pool #{pool_id}</PoolTitle>
                      <StyledTextForTokens kind="wrapper">
                        <StyledTextForTokens kind="element">
                          <StyledImageForToken src="https://i.ibb.co/T0TrSgT/block-logo.png" />
                          {tokenA.symbol}
                        </StyledTextForTokens>
                        <StyledTextForTokens kind="element">
                          <StyledImageForToken
                            as={tokenB.logoURI ? 'img' : 'div'}
                            src={tokenB.logoURI}
                          />
                          {tokenB.symbol}
                        </StyledTextForTokens>
                      </StyledTextForTokens>
                    </StyledRowForTokensInfo>
                    <StyledRowForTokensInfo kind="column">
                      {isLoading
                        ? ''
                        : `1 ${tokenA.symbol} = ${tokenPrice.toFixed(2)} ${
                            tokenB.symbol
                          }`}
                    </StyledRowForTokensInfo>
                  </StyledRowForTokensInfo>

                  <StyledDivForSeparator />

                  <StyledElementForLiquidity kind="wrapper">
                    <StyledElementForLiquidity kind="row">
                      <LHeader>Total Liquidity</LHeader>
                      <LHeader>APR reward</LHeader>
                    </StyledElementForLiquidity>
                    <StyledElementForLiquidity kind="row">
                      <LValue>
                        {parseCurrency(totalLiquidity?.dollarValue)}
                      </LValue>
                      <LValue>{displayApr(farmInfo?.apr)}%</LValue>
                    </StyledElementForLiquidity>
                  </StyledElementForLiquidity>
                </LiquidityInfoWrapper>

                <Stack>
                  <ChakraText
                    fontSize="24px"
                    fontWeight="600"
                    fontFamily="Trajan"
                  >
                    Personal shares
                  </ChakraText>
                  <StyledDivForCards>
                    <PoolAvailableLiquidityCard
                      myLiquidity={myLiquidity}
                      myReserve={myReserve}
                      totalLiquidity={totalLiquidity}
                      tokenDollarValue={tokenDollarValue}
                      tokenASymbol={tokenA.symbol}
                      tokenBSymbol={tokenB.symbol}
                      onButtonClick={() =>
                        setIsManageLiquidityDialogShowing(true)
                      }
                    />
                    <PoolBondedLiquidityCard
                      onButtonClick={() => setIsBondingDialogShowing(true)}
                      myLiquidity={myLiquidity}
                      stakedAmount={farmInfo?.userStaked}
                      totalLiquidity={totalLiquidity}
                      tokenASymbol={tokenA.symbol}
                      tokenBSymbol={tokenB.symbol}
                    />
                  </StyledDivForCards>
                  {__POOL_REWARDS_ENABLED__ && unbondings.length > 0 && (
                    <>
                      <ChakraText fontSize="24px" fontWeight="600">
                        Unbonding Liquidity
                      </ChakraText>
                      <StyledElementForUnbonding kind="list">
                        {unbondings?.map((unbonding, index) => (
                          <UnbondingLiquidityCard
                            key={unbonding[1] + index.toString()}
                            totalLiquidity={totalLiquidity}
                            unbonding={unbonding}
                            index={index}
                            lockInterval={Number(farmInfo?.withdraw_interval)}
                            onWithdraw={onWithdraw}
                          />
                        ))}
                      </StyledElementForUnbonding>
                    </>
                  )}
                </Stack>
              </Stack>
            )}
          </ContentWrapper>
        </Container>
      </AppLayout>
    </ChakraProvider>
  )
}

const Header = styled('div', {
  fontSize: '40px',
  fontWeight: '700',
  fontFamily: 'Trajan',
  '@media (max-width: 1550px)': {
    fontSize: '30px',
  },
})

const StyledNavElement = styled('div', {
  display: 'flex',
  variants: {
    position: {
      left: {
        flex: 0.1,
        justifyContent: 'flex-start',
      },
      center: {
        flex: 0.8,
        justifyContent: 'center',
      },
      right: {
        flex: 0.1,
        justifyContent: 'flex-end',
      },
    },
  },
})

const StyledDivForSeparator = styled('hr', {
  height: 0,
  borderTop: '1px solid rgba(255,255,255,0.1)',
  width: '100%',
})

const StyledRowForTokensInfo = styled('div', {
  display: 'flex',
  alignItems: 'center',
  color: 'white',
  fontFamily: 'Trajan',
  variants: {
    kind: {
      wrapper: {
        padding: '17px 36px',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        alignItems: 'center',
        '@media (max-width: 1550px)': {
          padding: '10px 36px',
        },
        '@media (max-width: 650px)': {
          padding: '10px 5px',
          justifyContent: 'center',
        },
      },
      column: {
        fontSize: '20px',
        flexWrap: 'wrap',
        '@media (max-width: 1550px)': {
          fontSize: '18px',
        },
      },
    },
  },
})

const StyledTextForTokens = styled('div', {
  display: 'grid',
  gridAutoFlow: 'column',
  alignItems: 'center',
  fontSize: '16px',
  fontFamily: 'Trajan',
  variants: {
    kind: {
      element: {
        columnGap: '6px',
      },
      wrapper: {
        columnGap: '23px',
      },
    },
  },
  '@media (max-width: 1550px)': {
    fontSize: '14px',
  },
})

const StyledImageForToken = styled('img', {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#ccc',
})

const StyledElementForLiquidity = styled('div', {
  variants: {
    kind: {
      wrapper: {
        padding: '10px 36px',
        '@media (max-width: 650px)': {
          padding: '10px',
        },
      },
      row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
  },
})

const StyledDivForCards = styled('div', {
  display: 'grid',
  columnGap: '18px',
  gridTemplateColumns: '1fr 1fr',
  '@media (max-width: 1024px)': {
    gridTemplateColumns: '1fr',
    rowGap: '10px',
  },
})

const StyledElementForUnbonding = styled('div', {
  variants: {
    kind: {
      list: {
        display: 'grid',
        rowGap: '8px',
        paddingBottom: 24,
      },
    },
  },
})

const StyledDivForSpinner = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
})

const LiquidityInfoWrapper = styled(GradientBackground, {
  '&:before': {
    borderRadius: '20px',
  },
})

const PoolTitle = styled('div', {
  fontFamily: 'Trajan',
  fontSize: '16px',
  marginRight: '20px',
  '@media (max-width: 1550px)': {
    fontSize: '16px',
  },
})

const LHeader = styled('div', {
  fontFamily: 'Trajan',
  fontSize: '18px',
  color: '#A1A1A1',
  '@media (max-width: 650px)': {
    fontSize: '12px',
  },
})

const LValue = styled('div', {
  fontSize: '20px',
  '@media (max-width: 1550px)': {
    fontSize: '20px',
  },
})

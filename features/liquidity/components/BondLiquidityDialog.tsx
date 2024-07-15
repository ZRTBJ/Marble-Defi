import { Dialog, StyledCloseIcon } from 'components/Dialog'
import { useSelector } from 'react-redux'
import { Text } from 'components/Text'
import { styled } from 'components/theme'
import { LiquidityInputSelector } from './LiquidityInputSelector'
import { useState, useMemo, useEffect } from 'react'
import {
  dollarValueFormatter,
  dollarValueFormatterWithDecimals,
} from 'util/conversion'
import { PercentageSelection } from './PercentageSelection'
import { BondingSummary } from './BondingSummary'
import { Divider } from './Divider'
import { DialogFooter } from './DialogFooter'
import { Button } from 'components/Button'
import { unsafelyGetTokenInfoFromAddress } from 'hooks/useTokenInfo'
import { TokenInfo } from 'hooks/useTokenList'
import { StateSwitchButtons } from './StateSwitchButtons'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import { usePoolList } from 'hooks/usePoolList'
import { getPoolLiquidity, LiquidityType } from 'hooks/usePoolLiquidity'
import { protectAgainstNaN } from 'util/conversion'
import { GradientBackground } from 'styles/styles'

const incentiveStart = 'April 26, 2022 20:59:45 UTC+00:00'
const incentiveEnd = 'March 27, 2099 00:00:00 UTC+00:00'

export const BondLiquidityDialog = ({
  isShowing,
  onRequestClose,
  poolId,
  lpTokenAmount,
  bonded,
  onSubmit,
}) => {
  // const [pool_id, setPoolId] = useState(0)
  const [decimals, setDecimals] = useState(24)
  const [poolList] = usePoolList()

  const [tokenA, setTokenA] = useState<TokenInfo>()
  const [tokenB, setTokenB] = useState<TokenInfo>()
  const coinPrice = useSelector((state: any) => state.uiData.token_value)
  const [totalLiquidity, setTotalLiquidity] = useState<LiquidityType>({
    coins: 0,
    dollarValue: 0,
  })
  const [myLiquidity, setMyLiquidity] = useState<LiquidityType>({
    coins: 0,
    dollarValue: 0,
  })
  // const [tokenDollarValue, setTokenDollarValue] = useState(0)
  // const [myReserve, setMyReserve] = useState<[number, number]>([0, 0])
  // const [reserve, setReserve] = useState<[number, number]>([0, 0])
  const [isLoading, setIsLoading] = useState(false)
  // const [tokenPrice, setTokenPrice] = useState(0)

  useEffect(() => {
    if (tokenA && tokenB) initialSet()
    if (!isNaN(Number(poolId)) && poolList) {
      const poolById = poolList?.find((p) => p?.pool_id === Number(poolId))
      // setPoolId(poolById?.pool_id)
      setDecimals(poolById?.decimals)
      const tokenA = unsafelyGetTokenInfoFromAddress(poolById?.token_address[0])
      const tokenB = unsafelyGetTokenInfoFromAddress(poolById?.token_address[1])
      setTokenA(tokenA)
      setTokenB(tokenB)
    }
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [poolId, poolList, tokenA, tokenB, coinPrice])

  const initialSet = () => {
    setIsLoading(true)
    // eslint-disable-line react-hooks/rules-of-hooks
    getPoolLiquidity({
      poolId: Number(poolId),
      tokenAddress: [tokenA?.token_address, tokenB?.token_address],
      decimals,
      coinPrice,
    })
      .then(({ liquidity }) => {
        setTotalLiquidity(liquidity.totalLiquidity)
        setMyLiquidity(liquidity.myLiquidity)
        // setTokenDollarValue(liquidity.tokenDollarValue)
        // setMyReserve(liquidity.myReserve)
        // setReserve(liquidity.reserve)
        setIsLoading(false)
        // setTokenPrice(
        // protectAgainstNaN(liquidity.reserve[1] / liquidity.reserve[0])
        // )
      })
      .catch((err) => {
        console.log(err)
        setIsLoading(false)
      })
  }

  const [liquidityDollarAmount, setLiquidityDollarAmount] = useState(0)

  const [dialogState, setDialogState] = useState<'bond' | 'unbond'>('bond')
  const tokenAmount = useMemo(
    () => (dialogState === 'bond' ? lpTokenAmount : bonded),
    [dialogState, lpTokenAmount]
  )
  const maxDollarValueLiquidity = useMemo(
    () =>
      dialogState === 'bond'
        ? myLiquidity?.dollarValue ?? 0
        : (Number(bonded) / totalLiquidity?.coins) *
            totalLiquidity.dollarValue ?? 0,
    [dialogState, myLiquidity, totalLiquidity, bonded]
  )

  const canManageBonding = true

  const handleClick = async () => {
    if (isLoading || !liquidityDollarAmount) return
    setIsLoading(true)
    const now = new Date()
    if (
      now.getTime() < new Date(incentiveStart).getTime() ||
      now.getTime() > new Date(incentiveEnd).getTime()
    ) {
      toast.error('Incentives are not started yet!')
      return
    }
    await onSubmit({
      type: dialogState,
      amount: Number(
        tokenAmount * (liquidityDollarAmount / maxDollarValueLiquidity)
      ),
      isFull: liquidityDollarAmount / maxDollarValueLiquidity === 1,
    })
    setIsLoading(false)
    setLiquidityDollarAmount(0)
    onRequestClose()
  }
  return (
    <Dialog kind="blank" isShowing={isShowing} onRequestClose={onRequestClose}>
      <StyledCloseIcon onClick={onRequestClose} offset={19} size="40px" />

      <StyledDivForContent>
        {canManageBonding ? (
          <Title>Manage LP Tokens</Title>
        ) : (
          <>
            <Title>Bond tokens</Title>
            <Text
              variant="body"
              css={{
                paddingBottom: '$6',
                fontFamily: 'Trajan',
                fontSize: '16px',
              }}
            >
              Choose how many tokens to bond
            </Text>
          </>
        )}
      </StyledDivForContent>

      {canManageBonding && (
        <>
          <StyledDivForContent kind="bondingHeader">
            <StateSwitchButtons
              activeValue={dialogState === 'bond' ? 'bonding' : 'unbonding'}
              values={['bonding', 'unbonding']}
              onStateChange={(value) => {
                setDialogState(value === 'bonding' ? 'bond' : 'unbond')
              }}
            />
          </StyledDivForContent>
          <Divider />
          <StyledDivForContent>
            <Text
              variant="body"
              css={{
                padding: '$6 0',
                fontFamily: 'Trajan',
                fontSize: '16px',
                textAlign: 'left',
              }}
            >
              Choose your token amount
            </Text>
          </StyledDivForContent>
        </>
      )}
      <StyledDivForContentWrapper>
        <LiquidityInputSelector
          maxLiquidity={maxDollarValueLiquidity}
          liquidity={liquidityDollarAmount}
          onChangeLiquidity={(value) => setLiquidityDollarAmount(value)}
        />
        <Text
          variant="caption"
          color="primary"
          css={{ padding: '$6 0 $9', fontFamily: 'Trajan', textAlign: 'left' }}
        >
          Max available for bonding is worth $
          {dollarValueFormatterWithDecimals(maxDollarValueLiquidity, {
            includeCommaSeparation: true,
          })}
        </Text>
        <Divider />
        <PercentageSelection
          maxLiquidity={maxDollarValueLiquidity}
          liquidity={liquidityDollarAmount}
          onChangeLiquidity={setLiquidityDollarAmount}
        />
      </StyledDivForContentWrapper>
      <StyledDivForContent>
        <BondingSummary
          label={dialogState === 'bond' ? 'Bonding' : 'Unbonding'}
          lpTokenAmount={tokenAmount}
          tokenA={tokenA}
          tokenB={tokenB}
          maxLiquidity={maxDollarValueLiquidity}
          liquidityAmount={liquidityDollarAmount}
          onChangeLiquidity={setLiquidityDollarAmount}
        />
      </StyledDivForContent>
      <StyledDivForContent>
        <DialogFooter
          title={
            dialogState === 'bond'
              ? 'Unbonding Period: 14 days'
              : `Available on: ${dayjs().add(14, 'day').format('MMMM D YYYY')}`
          }
          text={
            dialogState === 'bond'
              ? "There'll be 14 days from the time you decide to unbond your tokens, to the time you can redeem your previous bond."
              : `Because of the 14 days unbonding period, you will be able to redeem your $${dollarValueFormatter(
                  liquidityDollarAmount,
                  {
                    includeCommaSeparation: true,
                  }
                )} worth of bonded token on ${dayjs()
                  .add(14, 'day')
                  .format('MMM D')}.`
          }
          buttons={
            <>
              <PrimaryButton kind="primary" onClick={onRequestClose}>
                Cancel
              </PrimaryButton>
              <PrimaryButton
                onClick={handleClick}
                loading={isLoading}
                disabled={isLoading || !liquidityDollarAmount}
                kind="secondary"
              >
                {dialogState === 'bond' ? 'Bond' : 'Unbond'}
              </PrimaryButton>
            </>
          }
        />
      </StyledDivForContent>
    </Dialog>
  )
}

const StyledDivForContentWrapper = styled(GradientBackground, {
  padding: '25px 30px 0 30px',
  margin: '0 25px',
  '@media (max-width: 1550px)': {
    padding: '25px 20px 0 20px',
  },

  '@media (max-width: 480px)': {
    padding: '25px 10px 0 10px',
    margin: '0 10px',
  },

  '&:before': {
    borderRadius: '20px',
  },
})
const StyledDivForContent = styled('div', {
  padding: '0px 28px',
  '@media(max-width: 480px)': {
    padding: '0px 10px',
  },
  variants: {
    kind: {
      form: {
        border: '1px solid rgba(255, 255, 255, 0.2)',
        background: 'rgb(49, 49, 56)',
        boxShadow:
          '0px 4px 40px rgb(42 47 50 / 9%), inset 0px 7px 24px rgb(109 109 120 / 20%)',
        borderRadius: '20px',
        padding: '25px 30px 0 30px',
        '@media (max-width: 1550px)': {
          padding: '25px 20px 0 20px',
        },
        '@media (max-width: 650px)': {
          padding: '25px 5px 0 5px',
        },
        margin: '0 25px',
      },
      bondingHeader: {
        paddingBottom: 16,
        '@media (max-width: 650px)': {
          padding: '0 0px',
        },
      },
      text: {
        fontSize: 5,
      },
    },
  },
})
const Title = styled('div', {
  fontSize: '20px',
  fontFamily: 'Trajan',
  color: 'white',
})
const PrimaryButton = styled(Button, {
  width: '140px',
  fontFamily: 'Trajan',
  fontSize: '14px',
  borderRadius: '20px',
  height: '50px',
  variants: {
    kind: {
      primary: {
        border: '1px solid #FFFFFF',
        color: 'white',
        background: 'none',
      },
      secondary: {
        background: 'white',
        color: 'black',
      },
    },
  },
})

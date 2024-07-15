import { Button, ChakraProvider, HStack, Stack } from '@chakra-ui/react'
import { Dialog, StyledCloseIcon } from 'components/Dialog'
import { LiquidityInput } from 'components/LiquidityInput'
import { Text } from 'components/Text'
import { usePoolList } from 'hooks/usePoolList'
import { getTokenBalance } from 'hooks/useTokenBalance'
import { useNearDollarValue } from 'hooks/useTokenDollarValue'
import {
  unsafelyGetTokenInfoFromAddress,
  useTokenInfoByPoolId,
} from 'hooks/useTokenInfo'
import { RoundedPlus } from 'icons'
import { utils } from 'near-api-js'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { GradientBackground } from 'styles/styles'
import {
  convertDenomToMicroDenom,
  dollarValueFormatterWithDecimals,
  formatTokenBalance,
  protectAgainstNaN,
} from 'util/conversion'
import { IconWrapper } from '../../../../components/IconWrapper'
import { UseRemoveLiquidity } from '../../../../state/pool'
import { addLiquidityToPool, Pool } from '../../../../util/pool'
import { Divider } from '../Divider'
import { LiquidityInputSelector } from '../LiquidityInputSelector'
import { PercentageSelection } from '../PercentageSelection'
import { StateSwitchButtons } from '../StateSwitchButtons'
import { usePoolDialogController } from './usePoolDialogController'

type ManagePoolDialogProps = {
  isShowing: boolean
  onRequestClose: () => void
  poolInfo: PoolDataType
}

type PoolDataType = {
  poolId: string
  reserve: [number, number]
  myReserve: [number, number]
  myLiquidity: {
    coins: number
    dollarValue: number
  }
  totalLiquidity: {
    coins: number
    dollarValue: number
  }
}

export const ManagePoolDialog = ({
  isShowing,
  onRequestClose,
  poolInfo,
}: ManagePoolDialogProps) => {
  // @ts-ignore
  const tokenInfo = useTokenInfoByPoolId(poolInfo.poolId)
  const [tokenABalance, setTokenABalance] = useState(0)
  const [tokenBBalance, setTokenBBalance] = useState(0)
  const [fee, setFee] = useState('0.30')
  const [slippage, setSlippage] = useState(0.5)

  const [isAddingLiquidity, setAddingLiquidity] = useState(true)

  const [addLiquidityAmounts, setAddLiquidityAmounts] = useState([0, 0])
  const [isLoading, setIsLoading] = useState(false)
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState(0)
  const [poolList] = usePoolList()
  const poolById = poolList?.find((p) => p?.pool_id === Number(poolInfo.poolId))
  const tokenA = unsafelyGetTokenInfoFromAddress(poolById?.token_address[0])
  const tokenB = unsafelyGetTokenInfoFromAddress(poolById?.token_address[1])

  useEffect(() => {
    getTokenBalance(tokenA).then((bal) => {
      setTokenABalance(bal)
    })
    getTokenBalance(tokenB).then((bal) => {
      setTokenBBalance(bal)
    })
  }, [tokenA, tokenB])

  const {
    state: { maxApplicableBalanceForTokenA, maxApplicableBalanceForTokenB },
  } = usePoolDialogController({
    tokenA,
    tokenB,
    tokenABalance: tokenABalance,
    tokenBBalance: tokenBBalance,
    reserve: poolInfo.reserve,
    myReserve: poolInfo.myReserve,
    myLiquidity: poolInfo.myLiquidity,
  })

  const canManageLiquidity = poolInfo.reserve[0] > 0

  const submitAddLiquidity = () => {
    const id = Number(poolInfo.poolId)
    const tokenAmounts = []
    tokenAmounts.push({
      amount: addLiquidityAmounts[0].toString(),
      token: {
        decimals: tokenA.decimals,
        icon: tokenA.logoURI,
        id: tokenA.token_address,
        name: tokenA.name,
        Symbol: tokenA.symbol,
      },
    })
    tokenAmounts.push({
      amount: addLiquidityAmounts[1].toString(),
      token: {
        decimals: tokenB.decimals,
        icon: tokenB.logoURI,
        id: tokenB.token_address,
        name: tokenB.name,
        Symbol: tokenB.symbol,
      },
    })
    setIsLoading(true)
    addLiquidityToPool({ id, tokenAmounts })
  }

  const submitRemoveLiquidity = () => {
    const shares = protectAgainstNaN(
      (removeLiquidityAmount * poolInfo.totalLiquidity.coins) /
        poolInfo.totalLiquidity.dollarValue
    )
    const totalInMicro = utils.format.parseNearAmount(
      poolInfo.totalLiquidity.coins.toString()
    )
    const sharesInMicro = utils.format.parseNearAmount(shares.toString())
    let reserveA
    let reserveB
    if (tokenA.decimals === 24)
      reserveA = utils.format.parseNearAmount(poolInfo.reserve[0].toString())
    else
      reserveA = convertDenomToMicroDenom(poolInfo.reserve[0], tokenA.decimals)
    if (tokenB.decimals === 24)
      reserveB = utils.format.parseNearAmount(poolInfo.reserve[1].toString())
    else
      reserveB = convertDenomToMicroDenom(poolInfo.reserve[1], tokenB.decimals)
    const pool: Pool = {
      id: Number(poolInfo.poolId),
      shareSupply: totalInMicro.toString(),
      supplies: {
        [tokenA.token_address]: reserveA,
        [tokenB.token_address]: reserveB,
      },
      fee: poolById.fee,
      tvl: poolInfo.totalLiquidity.dollarValue,
      token0_ref_price: undefined,
      tokenIds: [tokenA.token_address, tokenB.token_address],
    }

    const { minimumAmounts, removeLiquidity } = UseRemoveLiquidity({
      pool,
      slippageTolerance: slippage,
      shares: sharesInMicro.toString(),
    })

    setIsLoading(true)
    removeLiquidity()
  }

  return (
    <ChakraProvider>
      <Dialog
        isShowing={isShowing}
        onRequestClose={onRequestClose}
        kind="blank"
      >
        <StyledCloseIcon onClick={onRequestClose} offset={19} size="40px" />

        <StyledDivForContent>
          <Title>Manage liquidity</Title>
        </StyledDivForContent>

        {canManageLiquidity && (
          <>
            <HStack justifyContent="center">
              <StateSwitchButtons
                activeValue={isAddingLiquidity ? 'add' : 'remove'}
                values={['add', 'remove']}
                onStateChange={(value) => {
                  setAddingLiquidity(value === 'add')
                }}
              />
            </HStack>
            <Divider offsetY={16} />
          </>
        )}
        <ContentWrapper>
          <Stack textAlign="left">
            <Text
              variant="body"
              css={{
                paddingBottom: '$6',
                fontFamily: 'Trajan',
                fontSize: '16px',
              }}
            >
              Choose how much to {isAddingLiquidity ? 'add' : 'remove'}
            </Text>
          </Stack>
          <AddOrRemoveLiquidityWrapper>
            {isAddingLiquidity && (
              <AddLiquidityContent
                isLoading={false}
                tokenASymbol={tokenA?.symbol}
                tokenBSymbol={tokenB?.symbol}
                tokenABalance={tokenABalance}
                tokenBBalance={tokenBBalance}
                maxApplicableBalanceForTokenA={maxApplicableBalanceForTokenA}
                maxApplicableBalanceForTokenB={maxApplicableBalanceForTokenB}
                liquidityAmounts={addLiquidityAmounts}
                onChangeLiquidity={setAddLiquidityAmounts}
              />
            )}

            {!isAddingLiquidity && (
              <RemoveLiquidityContent
                tokenA={tokenA}
                tokenB={tokenB}
                tokenAReserve={poolInfo.myReserve[0]}
                tokenBReserve={poolInfo.myReserve[1]}
                liquidityAmount={removeLiquidityAmount}
                totalLiquidity={poolInfo.totalLiquidity}
                myLiquidity={poolInfo.myLiquidity}
                onChangeLiquidity={setRemoveLiquidityAmount}
              />
            )}
          </AddOrRemoveLiquidityWrapper>
          <StyledDivForContent>
            <StyledDivForFooter>
              <PrimaryButton onClick={onRequestClose}>Cancel</PrimaryButton>
              <SecondaryButton
                onClick={
                  isAddingLiquidity ? submitAddLiquidity : submitRemoveLiquidity
                }
                disabled={
                  (isAddingLiquidity &&
                    (!addLiquidityAmounts[0] || !addLiquidityAmounts[1])) ||
                  (!isAddingLiquidity && !removeLiquidityAmount)
                }
                loading={isLoading}
              >
                {isAddingLiquidity ? 'Add' : 'Remove'} liquidity
              </SecondaryButton>
            </StyledDivForFooter>
          </StyledDivForContent>
        </ContentWrapper>
      </Dialog>
    </ChakraProvider>
  )
}

function AddLiquidityContent({
  liquidityAmounts,
  tokenASymbol,
  tokenBSymbol,
  tokenABalance,
  tokenBBalance,
  maxApplicableBalanceForTokenA,
  maxApplicableBalanceForTokenB,
  isLoading,
  onChangeLiquidity,
}) {
  const preferredToken = tokenABalance === maxApplicableBalanceForTokenA
  const percentageInputRef = useRef<HTMLInputElement>()
  useEffect(() => {
    percentageInputRef.current?.focus()
  }, [])
  const handleTokenAAmountChange = (input: number) => {
    const value = Math.min(input, maxApplicableBalanceForTokenA)

    onChangeLiquidity([
      value,
      protectAgainstNaN(value / maxApplicableBalanceForTokenA) *
        maxApplicableBalanceForTokenB,
    ])
  }

  const handleTokenBAmountChange = (input: number) => {
    const value = Math.min(input, maxApplicableBalanceForTokenB)

    onChangeLiquidity([
      protectAgainstNaN(
        (value / maxApplicableBalanceForTokenB) * maxApplicableBalanceForTokenA
      ),
      value,
    ])
  }

  const handleApplyMaximumAmount = () => {
    handleTokenAAmountChange(maxApplicableBalanceForTokenA)
  }
  const handleChangeTokenAmount = (value) => {
    if (preferredToken) handleTokenAAmountChange(value)
    else handleTokenBAmountChange(value)
  }
  return (
    <Stack spacing={10} alignItems="center">
      <StyledDivForRemoveLiquidityInputs>
        <StyledDivForAddLiquidityInputsWrapper>
          <LiquidityInput
            tokenSymbol={tokenASymbol}
            availableAmount={tokenABalance ? tokenABalance : 0}
            maxApplicableAmount={maxApplicableBalanceForTokenA}
            amount={liquidityAmounts[0]}
            onAmountChange={handleTokenAAmountChange}
          />
          <LiquidityInput
            tokenSymbol={tokenBSymbol}
            availableAmount={tokenBBalance ? tokenBBalance : 0}
            maxApplicableAmount={maxApplicableBalanceForTokenB}
            amount={liquidityAmounts[1]}
            onAmountChange={handleTokenBAmountChange}
          />
          <LiquidityInputSelector
            inputRef={percentageInputRef}
            maxLiquidity={
              preferredToken
                ? maxApplicableBalanceForTokenA
                : maxApplicableBalanceForTokenB
            }
            liquidity={
              preferredToken ? liquidityAmounts[0] : liquidityAmounts[1]
            }
            onChangeLiquidity={handleChangeTokenAmount}
          />
          {/* <StyledGridForDollarValueTxInfo>
            <Text
              variant="caption"
              color="primary"
              css={{ padding: '$6 0 $9', fontFamily: 'Trajan' }}
            >
              Available:&nbsp;
              {dollarValueFormatterWithDecimals(maxApplicableBalanceForTokenA, {
                includeCommaSeparation: true,
              })}
            </Text>
          </StyledGridForDollarValueTxInfo> */}
        </StyledDivForAddLiquidityInputsWrapper>

        <Divider />
        <PercentageSelection
          maxLiquidity={
            preferredToken
              ? maxApplicableBalanceForTokenA
              : maxApplicableBalanceForTokenB
          }
          liquidity={preferredToken ? liquidityAmounts[0] : liquidityAmounts[1]}
          onChangeLiquidity={handleChangeTokenAmount}
        />
      </StyledDivForRemoveLiquidityInputs>
    </Stack>
  )
}

function RemoveLiquidityContent({
  tokenA,
  tokenB,
  tokenAReserve,
  tokenBReserve,
  liquidityAmount,
  onChangeLiquidity,
  totalLiquidity,
  myLiquidity,
}) {
  // Todo: implement token price calculate
  const percentageInputRef = useRef<HTMLInputElement>()
  // const tokenPrice = useNearDollarValue()
  useEffect(() => {
    percentageInputRef.current?.focus()
  }, [])

  const availableLiquidityDollarValue = myLiquidity.dollarValue

  // const liquidityToRemove = availableLiquidityDollarValue * liquidityPercentage

  const handleChangeLiquidity = (value) => {
    onChangeLiquidity(value)
  }
  // console.log(
  //   'removeLiquidity: ',
  //   percentageInputRef,
  //   availableLiquidityDollarValue,
  //   liquidityAmount
  // )
  return (
    <>
      <StyledDivForRemoveLiquidityInputs>
        <StyledDivForRemoveLiquidityInputsWrapper>
          <LiquidityInputSelector
            inputRef={percentageInputRef}
            maxLiquidity={availableLiquidityDollarValue}
            liquidity={liquidityAmount}
            onChangeLiquidity={handleChangeLiquidity}
          />
          <StyledGridForDollarValueTxInfo>
            <Text
              variant="caption"
              color="primary"
              css={{ padding: '$6 0 $9', fontFamily: 'Trajan' }}
            >
              Available liquidity: $
              {dollarValueFormatterWithDecimals(availableLiquidityDollarValue, {
                includeCommaSeparation: true,
              })}
            </Text>
            <Text
              variant="caption"
              color="primary"
              css={{ padding: '$6 0 $9' }}
            >
              ≈ ${' '}
              {dollarValueFormatterWithDecimals(liquidityAmount, {
                includeCommaSeparation: true,
              })}
            </Text>
          </StyledGridForDollarValueTxInfo>
        </StyledDivForRemoveLiquidityInputsWrapper>

        <Divider />
        <PercentageSelection
          maxLiquidity={availableLiquidityDollarValue}
          liquidity={liquidityAmount}
          onChangeLiquidity={handleChangeLiquidity}
        />
      </StyledDivForRemoveLiquidityInputs>

      <StyledDivForContent>
        <Text
          variant="body"
          css={{
            padding: '20px 0',
            textAlign: 'left',
            fontFamily: 'Trajan',
            fontSize: '16px',
          }}
        >
          Removing
        </Text>
        <StyledDivForLiquiditySummary>
          <StyledDivForToken>
            <StyledImageForTokenLogo src={tokenA?.logoURI} alt={tokenA?.name} />
            {formatTokenBalance(
              (tokenAReserve * liquidityAmount) / myLiquidity.dollarValue
            )}{' '}
            {tokenA?.symbol}
          </StyledDivForToken>
          <StyledDivForToken>
            <StyledImageForTokenLogo src={tokenB.logoURI} alt={tokenB?.name} />
            {formatTokenBalance(
              (tokenBReserve * liquidityAmount) / myLiquidity.dollarValue
            )}{' '}
            {tokenB.symbol}
          </StyledDivForToken>
        </StyledDivForLiquiditySummary>
      </StyledDivForContent>
    </>
  )
}

const PrimaryButton = styled(Button)`
  background: rgba(5, 6, 22, 0.2) !important;
  border-radius: 20px !important;
  border: 1px solid white;
  height: 50px !important;
  width: 143px !important;
  color: white;
  font-size: 14px !important;
`
const SecondaryButton = styled(Button)`
  box-shadow: 0px 10px 30px rgba(42, 47, 50, 0.2) !important;
  backdrop-filter: blur(14px);
  /* Note: backdrop-filter has minimal browser support */
  border-radius: 20px !important;
  height: 50px !important;
  width: 170px !important;
  color: black;
  font-size: 14px !important;
`

const StyledDivForContent = styled.div``

const MaxButton = styled(Button)`
  background-color: rgb(49, 49, 56) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0px 4px 40px rgb(42 47 50 / 9%),
    inset 0px 7px 24px rgb(109 109 120 / 20%) !important;
  border-radius: 20px !important;
  color: white !important;
  width: fit-content;
  height: 54px !important;
  font-family: Trajan;
`

const StyledDivForLiquidityInputs = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 16px;
  width: 100%;
  background-color: rgb(49, 49, 56);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgb(42 47 50 / 9%),
    inset 0px 7px 24px rgb(109 109 120 / 20%);
  border-radius: 20px;
  padding: 25px 30px;
  @media (max-width: 1550px) {
    padding: 25px 20px;
  }
`
const StyledDivForRemoveLiquidityInputs = styled(GradientBackground)`
  width: 100%;
  &:before {
    border-radius: 20px;
  }
`
const StyledDivForRemoveLiquidityInputsWrapper = styled.div`
  padding: 25px 30px 0 30px;
  @media (max-width: 1550px) {
    padding: 25px 20px 0 25px;
  }
`

const StyledDivForAddLiquidityInputsWrapper = styled.div`
  padding: 25px 30px 25px 30px;
  display: flex;
  flex-direction: column;
  row-gap: 16px;
  @media (max-width: 1550px) {
    padding: 25px 20px 25px 25px;
  }
`

const StyledDivForFooter = styled.div`
  display: flex;
  justify-content: center;
  column-gap: 10px;
  padding: 10px 0 40px 0;
  font-family: Trajan;
`

const StyledDivForDivider = styled.div`
  padding-top: 10px;
`

const StyledGridForDollarValueTxInfo = styled.div`
  display: flex;
  justify-content: space-between;
`

const StyledDivForLiquiditySummary = styled(GradientBackground)`
  display: flex;
  align-items: center;
  column-gap: 30px;
  padding: 25px 30px 25px 30px;
  @media (max-width: 1550px) {
    padding: 25px 20px 25px 25px;
  }
  &:before {
    border-radius: 20px;
  }
`

const StyledDivForToken = styled.div`
  display: flex;
  column-gap: 10px;
  align-items: center;
  font-size: 12px;
  font-family: Trajan;
  color: white;
`

const StyledImageForTokenLogo = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
`

const AddOrRemoveLiquidityWrapper = styled.div``
const Title = styled.div`
  font-size: 20px;
  font-family: Trajan;
  color: white;
`
const ContentWrapper = styled.div`
  padding: 0 36px;
  @media (max-width: 650px) {
    padding: 0 15px;
  }
`

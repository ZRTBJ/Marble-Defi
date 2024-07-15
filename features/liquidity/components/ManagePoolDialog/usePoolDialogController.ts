import {
  convertMicroDenomToDenom,
  protectAgainstNaN
} from 'util/conversion'
import { TokenInfo } from 'hooks/useTokenList'

type UsePoolDialogControllerArgs = {
  /* value from 0 to 1 */
  tokenA: TokenInfo,
  tokenB: TokenInfo,
  reserve: [number, number],
  myReserve: [number, number],
  myLiquidity: {
    coins: number,
    dollarValue: number
  },
  tokenABalance: number,
  tokenBBalance: number
}

export const usePoolDialogController = ({
  tokenABalance,
  tokenBBalance,
  tokenA,
  tokenB,
  reserve,
  myReserve,
  myLiquidity
}: UsePoolDialogControllerArgs) => {

  function calculateMaxApplicableBalances() {
    // TODO: Make slippage configurable
    const slippage = 0.99
    const tokenAToTokenBRatio = protectAgainstNaN(
      (reserve?.[0] * slippage) / reserve?.[1]
    )
    const tokenABalanceMinusGasFee = Math.max(tokenABalance, 0)
    const isTokenALimitingFactor =
      tokenABalance < tokenBBalance * tokenAToTokenBRatio

    if (isTokenALimitingFactor) {
      return {
        tokenA: tokenABalanceMinusGasFee,
        tokenB: Math.min(
          tokenABalanceMinusGasFee / tokenAToTokenBRatio,
          tokenBBalance
        ),
      }
    }

    return {
      tokenA: Math.min(tokenBBalance * tokenAToTokenBRatio, tokenABalance),
      //tokenA: tokenABalance,
      tokenB: tokenBBalance,
    }
  }

  const {
    tokenA: maxApplicableBalanceForTokenA,
    tokenB: maxApplicableBalanceForTokenB,
  } = calculateMaxApplicableBalances()

  const tokenAReserve = myReserve?.[0]
    ? convertMicroDenomToDenom(myReserve[0], tokenA?.decimals)
    : 0
  const tokenBReserve = myReserve?.[1]
    ? convertMicroDenomToDenom(myReserve[1], tokenB.decimals)
    : 0

  return {
    state: {
      myLiquidity,
      myReserve,
      tokenAReserve,
      tokenBReserve,
      tokenASymbol: tokenA?.symbol,
      tokenABalance: tokenABalance,
      tokenBBalance,
      maxApplicableBalanceForTokenA,
      maxApplicableBalanceForTokenB,
    }
  }
}


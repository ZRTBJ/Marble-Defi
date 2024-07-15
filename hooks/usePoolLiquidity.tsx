import { useNearDollarValue } from './useTokenDollarValue'
import { convertMicroDenomToDenom, protectAgainstNaN } from 'util/conversion'
import * as nearAPI from 'near-api-js'
import { unsafelyGetTokenInfoFromAddress } from 'hooks/useTokenInfo'
import { useConnectWallet } from './useConnectWallet'
import { useSelector } from 'react-redux'
// import {refFiViewFunction} from "../util/near"

export type LiquidityType = {
  coins: number
  dollarValue: number
}

export type LiquidityInfoType = {
  pool_id: number
  reserve: [number, number]
  myReserve: [number, number]
  totalLiquidity: LiquidityType
  myLiquidity: LiquidityType
  tokens: [string, string]
  /* pretty hacky - refactor when implementing decimals support */
  tokenDollarValue: number
}

export type PoolRequestType = {
  pool_id: number
  decimals: number
  token_address: string[]
}

export type LiquidtyRequestType = {
  pools: PoolRequestType[]
  coinPrice: any
}

export type LiquidityReturnType = {
  liquidity: LiquidityInfoType[]
}

export const getPoolLiquidity = async ({
  poolId,
  tokenAddress,
  decimals,
  coinPrice,
}) => {
  const { liquidity } = await getMultiplePoolsLiquidity({
    pools:
      poolId !== undefined && tokenAddress.length > 0
        ? [{ pool_id: poolId, token_address: tokenAddress, decimals }]
        : undefined,
    coinPrice,
  })
  return { liquidity: liquidity?.[0] }
}

export const getMultiplePoolsLiquidity = async ({
  pools,
  coinPrice,
}: LiquidtyRequestType): Promise<LiquidityReturnType> => {
  const { getAccount } = useConnectWallet()
  const account = await getAccount()
  if (!account?.accountId) {
    return { liquidity: [] }
  }
  const hera = new nearAPI.Contract(
    account, // the account object that is connecting
    process.env.NEXT_PUBLIC_CONTRACT_NAME,
    {
      viewMethods: ['get_pool_shares', 'get_pool'],
      changeMethods: [],
    }
  )

  try {
    const poolInfos = await Promise.all(
      pools.map((p) => {
        // @ts-ignore
        return hera.get_pool({ pool_id: p.pool_id })
      })
    )

    const balInfos = await Promise.all(
      pools.map((p) => {
        // @ts-ignore
        return hera.get_pool_shares({
          account_id: account.accountId,
          pool_id: Number(p.pool_id),
        })
      })
    )

    // Todo: Add TOken price calculation algorithm
    const nearPrice: number = await useNearDollarValue()

    const liquidity: LiquidityInfoType[] = pools.map((p, index) => {
      const decimals = p.token_address.map(
        (token) => unsafelyGetTokenInfoFromAddress(token).decimals
      )
      const reserve: [number, number] = poolInfos[index].amounts.map(
        (a, index2) => convertMicroDenomToDenom(a, decimals[index2])
      )
      const tokens: [string, string] = poolInfos[index].token_account_ids
      const totalSupply: number = poolInfos[index].shares_total_supply
      const myshare = balInfos[index]

      const myReserve: [number, number] = [
        protectAgainstNaN((reserve[0] * myshare) / totalSupply),
        protectAgainstNaN((reserve[1] * myshare) / totalSupply),
      ]
      const totalUsd = protectAgainstNaN(
        reserve[0] * coinPrice[tokens[0]] * nearPrice * 2
      )
      const myUsd = protectAgainstNaN((totalUsd * myshare) / totalSupply)
      return {
        pool_id: p.pool_id,
        reserve,
        myReserve,
        totalLiquidity: {
          coins: convertMicroDenomToDenom(totalSupply, p.decimals),
          dollarValue: totalUsd,
        },
        myLiquidity: {
          coins: convertMicroDenomToDenom(myshare, p.decimals),
          dollarValue: myUsd,
        },
        tokens,
        tokenDollarValue: coinPrice[tokens[0]] * nearPrice,
      }
    })
    console.log('loading liquidity: ', liquidity)

    return { liquidity }
  } catch (err) {
    return { liquidity: [] }
  }
}

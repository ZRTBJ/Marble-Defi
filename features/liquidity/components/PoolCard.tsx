import Link from 'next/link'
import { useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { styled } from 'components/theme'
import { colorTokens } from '../../../util/constants'
import { Text } from '../../../components/Text'
import { useTokenInfo, useTokenInfoByPoolId } from '../../../hooks/useTokenInfo'
import { LiquidityType } from '../../../hooks/usePoolLiquidity'
import { IconWrapper } from '../../../components/IconWrapper'
import { Note } from '../../../icons'
import {
  dollarValueFormatterWithDecimals,
  protectAgainstNaN,
} from '../../../util/conversion'
import { TokenInfo } from 'hooks/useTokenList'
import { FarmInfo } from 'util/farm'
import { GradientBackground } from 'styles/styles'

type PoolCardProps = {
  poolId: string
  tokenA: TokenInfo
  tokenB: TokenInfo
  totalLiquidity: LiquidityType
  myLiquidity: LiquidityType
  tokenDollarValue: number
  farmInfo: FarmInfo
}

export const parseCurrency = (value: number | string) =>
  Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })

export const displayApr = (apr) => {
  if (!apr) {
    return '-'
  }
  const aprBig = new BigNumber(apr)
  if (aprBig.isEqualTo(0)) {
    return '0'
  } else if (aprBig.isLessThan(0.01)) {
    return '<0.01'
  } else {
    return aprBig.toFixed(2, 1)
  }
}

export const PoolCard = ({
  poolId,
  tokenA,
  tokenB,
  totalLiquidity,
  tokenDollarValue,
  myLiquidity,
  farmInfo,
}: PoolCardProps) => {
  return (
    <Link href={`/pools/${poolId}`} passHref>
      <StyledLinkForCard>
        <>
          <StyledDivForRowWrapper>
            <StyledDivForHeaderContainer>
              <StyledDivForTokenLogos>
                <StyledImageForTokenLogo
                  src={tokenA?.logoURI}
                  as={tokenA?.logoURI ? 'img' : 'div'}
                />
                <StyledImageForTokenLogo
                  src={tokenB?.logoURI}
                  as={tokenB?.logoURI ? 'img' : 'div'}
                />
              </StyledDivForTokenLogos>
              <StyledTextForTokenNames>
                {tokenA?.symbol} <span /> {tokenB.symbol}
              </StyledTextForTokenNames>
            </StyledDivForHeaderContainer>
          </StyledDivForRowWrapper>
        </>
        <StyledDivForSeparator />
        <StyledDivForLiquidityRows highlighted={true}>
          <StyledDivForRowWrapper>
            <StyledDivForRow>
              <CardTitle>Total liquidity</CardTitle>
              <CardValue>{parseCurrency(totalLiquidity.dollarValue)}</CardValue>
            </StyledDivForRow>
          </StyledDivForRowWrapper>
          <StyledDivForRowWrapper>
            <StyledDivForRow>
              <CardTitle>APR</CardTitle>
              <CardValue>{displayApr(farmInfo.apr)}%</CardValue>
            </StyledDivForRow>
          </StyledDivForRowWrapper>
          <StyledDivForRowWrapper>
            <StyledDivForRow>
              <CardTitle>My liquidity</CardTitle>
              <CardValue>{parseCurrency(myLiquidity.dollarValue)}</CardValue>
            </StyledDivForRow>
          </StyledDivForRowWrapper>
          <StyledDivForRowWrapper>
            <StyledDivForRow>
              <CardTitle>Bonded</CardTitle>
              <CardValue
                css={{
                  display: 'flex',
                  alignItems: 'center',
                  columnGap: '$space$1',
                }}
              >
                $
                {dollarValueFormatterWithDecimals(
                  (Number(farmInfo.userStaked) / totalLiquidity?.coins) *
                    totalLiquidity.dollarValue,
                  {
                    includeCommaSeparation: true,
                    applyNumberConversion: false,
                  }
                )}
              </CardValue>
            </StyledDivForRow>
          </StyledDivForRowWrapper>
        </StyledDivForLiquidityRows>
      </StyledLinkForCard>
    </Link>
  )
}

const StyledLinkForCard = styled(GradientBackground, {
  cursor: 'pointer',
  padding: '10px 0',
  '&:before': {
    borderRadius: '20px',
  },
})

const StyledDivForTokenLogos = styled('div', {
  alignItems: 'center',
  display: 'flex',
})

const StyledImageForTokenLogo = styled('img', {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  objectFit: 'fit',
  backgroundColor: '#ccc',
  position: 'relative',
  zIndex: 1,
  '&:first-child': {
    boxShadow: '0 0 0 $space$1 #E8E8E9',
    zIndex: 0,
  },
  '&:last-child': {
    left: '-$space$4',
  },
  '@media (max-width: 1550px)': {
    width: '30px',
    height: '30px',
  },
})

const StyledTextForTokenNames: typeof Text = styled('div', {
  display: 'flex',
  alignItems: 'center',
  fontSize: '16px',
  fontFamily: 'Trajan',
  '& span': {
    width: 4,
    height: 4,
    margin: '0 $3',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
  },
})

const StyledDivForSeparator = styled('div', {
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: 0,
})

const StyledDivForRowWrapper = styled('div', {
  padding: '10px 30px 10px 30px',
  position: 'relative',
  zIndex: 1,
})

const StyledDivForHeaderContainer = styled('div', {
  display: 'flex',
  alignItems: 'center',
})

const StyledDivForRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
})

const StyledDivForLiquidityRows = styled('div', {
  variants: {
    placeholder: {
      true: {
        display: 'grid',
        rowGap: 0,
        position: 'absolute !important',
        left: 0,
        bottom: 0,
        width: '100%',
        height: 'calc(100% - 100% / 3)',
      },
    },
    highlighted: {
      true: {
        position: 'relative',
        '&:after': {
          content: '""',
          position: 'absolute',
          zIndex: 0,
          left: 0,
          top: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          /*background:
            'radial-gradient(71.15% 71.14% at 19.4% 81.87%, #fd9f98 0%, rgba(247, 202, 100, 0) 100%)',*/
          opacity: 0.4,
          borderRadius: '0 0 8px 8px',
        },
      },
    },
  },
})

const CardTitle = styled('div', {
  fontFamily: 'Trajan',
  fontSize: '14px',
})

const CardValue = styled('div', {
  fontSize: '14px',
})

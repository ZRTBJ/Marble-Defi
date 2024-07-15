import { ChakraProvider, Text, Stack } from '@chakra-ui/react'
import { styled } from 'components/theme'
import { convertMicroDenomToDenom, formatTokenBalance } from 'util/conversion'
import { parseCurrency } from './PoolCard'
import { LiquidityInfoType } from 'hooks/usePoolLiquidity'
import { useTokenInfo } from 'hooks/useTokenInfo'
import { GradientBackground } from 'styles/styles'

type PoolAvailableLiquidityCardProps = Pick<
  LiquidityInfoType,
  'myLiquidity' | 'myReserve' | 'totalLiquidity' | 'tokenDollarValue'
> & {
  onButtonClick: () => void
  tokenASymbol: string
  tokenBSymbol: string
}

export const PoolAvailableLiquidityCard = ({
  onButtonClick,
  myLiquidity,
  myReserve,
  tokenDollarValue,
  totalLiquidity,
  tokenASymbol,
  tokenBSymbol,
}: PoolAvailableLiquidityCardProps) => {
  const tokenA = useTokenInfo(tokenASymbol)
  const tokenB = useTokenInfo(tokenBSymbol)
  return (
    <StyledElementForCardLayoutWrapper kind="wrapper">
      <StyledElementForCardLayout kind="content" name="liquidity">
        <Title>
          {typeof myLiquidity === 'number'
            ? `You own ${formatTokenBalance(
                ((myLiquidity as LiquidityInfoType['myLiquidity']).coins /
                  totalLiquidity.coins) *
                  100
              )}% of the pool`
            : 'Your liquidity'}
        </Title>
        <StyledTextForAmount>
          {parseCurrency(
            convertMicroDenomToDenom(myReserve[0]) * tokenDollarValue * 2 ||
              '0.00'
          )}
        </StyledTextForAmount>
      </StyledElementForCardLayout>
      <StyledElementForCardLayoutWrapper kind="content">
        <>Underlying assets</>
        <StyledElementForTokens kind="wrapper">
          <StyledElementForTokens kind="element">
            <StyledImageForToken
              as={tokenA?.logoURI ? 'img' : 'div'}
              src={tokenA?.logoURI}
              alt={tokenASymbol}
            />
            <Text>
              {formatTokenBalance(myReserve[0])} {tokenASymbol}
            </Text>
          </StyledElementForTokens>
          <StyledElementForTokens kind="element">
            <StyledImageForToken
              as={tokenA?.logoURI ? 'img' : 'div'}
              src={tokenB?.logoURI}
              alt={tokenBSymbol}
            />
            <Text>
              {formatTokenBalance(myReserve[1])} {tokenBSymbol}
            </Text>
          </StyledElementForTokens>
        </StyledElementForTokens>
      </StyledElementForCardLayoutWrapper>
      <StyledElementForCardLayout kind="content">
        <Button
          onClick={onButtonClick}
          css={{ fontFamily: 'Trajan', fontSize: '14px' }}
        >
          {myReserve[1] > 0 ? 'Manage liquidity' : 'Add liquidity'}
        </Button>
      </StyledElementForCardLayout>
    </StyledElementForCardLayoutWrapper>
  )
}

const StyledElementForCardLayoutWrapper = styled(GradientBackground, {
  display: 'flex',
  flexDirection: 'column',
  rowGap: '15px',
  justifyContent: 'space-between',
  fontFamily: 'Trajan',
  fontSize: '16px',
  '&:before': {
    borderRadius: '20px',
  },
  variants: {
    kind: {
      content: {
        padding: '17px 35px',
        '@media (max-width: 1550px)': {
          padding: '10px 28px',
        },
        '@media (max-width: 650px)': {
          padding: '20px 10px',
        },
      },
      wrapper: {
        padding: '17px 35px',
        '@media (max-width: 1550px)': {
          padding: '20px 28px',
        },
        '@media (max-width: 650px)': {
          padding: '20px 10px',
        },
      },
    },
  },
})

const StyledElementForCardLayout = styled('div', {
  variants: {
    kind: {
      content: {
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
    },
    name: {
      liquidity: {},
    },
  },
})
const Button = styled('div', {
  cursor: 'pointer',
  boxShadow: '0px 10px 30px rgba(42, 47, 50, 0.2)',
  background: 'white',
  color: 'black',
  padding: '13px 35px',
  borderRadius: '20px',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center',
  margin: '0 auto',
})
const StyledTextForAmount = styled('p', {
  fontSize: '22px',
  lineHeight: '$2',
  fontWeight: 600,
  '@media (max-width: 1550px)': {
    fontSize: '18px',
  },
})

const StyledElementForTokens = styled('div', {
  display: 'grid',

  variants: {
    kind: {
      element: {
        gridTemplateColumns: '20px auto',
        alignItems: 'center',
        columnGap: '$space$3',
      },
      wrapper: {
        gridTemplateColumns: '1fr 1fr',
        columnGap: '$space$8',
      },
    },
  },
})

const StyledImageForToken = styled('img', {
  width: 20,
  height: 20,
  borderRadius: '50%',
  backgroundColor: '#ccc',
})

const Title = styled('div', {
  fontFamily: 'Trajan',
  fontSize: '22px',
  '@media (max-width: 1550px)': {
    fontSize: '18px',
  },
})

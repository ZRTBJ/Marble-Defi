import { styled } from 'components/theme'
import { useTokenList } from 'hooks/useTokenList'
import { Text } from 'components/Text'
import { formatTokenBalance } from 'util/conversion'
import { getTokenBalance } from 'hooks/useTokenBalance'
import { useEffect, useState } from 'react'

export const TokenOptionsList = ({
  activeTokenSymbol,
  onSelect,
  isDeposit,
}) => {
  const [tokenList] = useTokenList()
  const tokens = isDeposit
    ? [tokenList?.native_token, tokenList.wrap_token]
    : tokenList?.tokens

  return (
    <>
      {tokens.length > 0 &&
        tokens.map((tokenInfo) => {
          return (
            <StyledDivForRow
              role="listitem"
              key={tokenInfo.symbol}
              active={tokenInfo.symbol === activeTokenSymbol}
              onClick={() => {
                onSelect(tokenInfo.symbol, tokenInfo.token_address)
              }}
            >
              <StyledDivForColumn kind="token">
                <StyledImgForTokenLogo
                  as={tokenInfo.logoURI ? 'img' : 'div'}
                  src={tokenInfo.logoURI}
                  alt={tokenInfo.symbol}
                />
                <div data-token-info="">
                  <Symbol>{tokenInfo.symbol}</Symbol>
                  <Text variant="caption" color="disabled">
                    {tokenInfo?.name}
                  </Text>
                </div>
              </StyledDivForColumn>
              <StyledDivForColumn kind="balance">
                <Symbol>
                  <FetchBalanceTextForTokenSymbol tokenInfo={tokenInfo} />
                </Symbol>
                <TokenValue>available</TokenValue>
              </StyledDivForColumn>
            </StyledDivForRow>
          )
        })}
    </>
  )
}

const FetchBalanceTextForTokenSymbol = ({ tokenInfo }) => {
  const [balance, setBalance] = useState(0)
  useEffect(() => {
    getTokenBalance(tokenInfo).then((bal) => {
      setBalance(bal)
    })
  }, [])
  return <>{formatTokenBalance(balance || 0)}</>
}

const StyledDivForRow = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 12px',
  borderRadius: '6px',
  userSelect: 'none',
  cursor: 'pointer',
  transition: 'background-color 0.1s ease-out',
  marginBottom: 5,
  '&:hover': {
    backgroundColor: 'gray',
  },
  '&:active': {
    backgroundColor: '$colors$dark05',
  },
  '&:last-child': {
    marginBottom: 0,
  },
  variants: {
    active: {
      true: {
        backgroundColor: '$colors$dark05',
      },
      false: {
        backgroundColor: '$colors$dark0',
      },
    },
  },
})

const StyledDivForColumn = styled('div', {
  display: 'grid',
  variants: {
    kind: {
      token: {
        columnGap: '$space$6',
        gridTemplateColumns: '30px 1fr',
        alignItems: 'center',
      },
      balance: {
        textAlign: 'right',
      },
    },
  },
})

const StyledImgForTokenLogo = styled('img', {
  width: '30px',
  height: '30px',
  borderRadius: '50%',
  backgroundColor: '#ccc',
})
const Symbol = styled('div', {
  fontSize: '24px',
  fontFamily: 'Trajan',
  '@media (max-width: 1550px)': {
    fontSize: '20px',
  },
  '@media (max-width: 650px)': {
    fontSize: '15px',
  },
})
const TokenValue = styled('div', {
  fontFamily: 'Trajan',
  fontSize: '12px',
  opacity: '0.5',
})

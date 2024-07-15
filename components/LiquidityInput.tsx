import React, { FC, useState } from 'react'
import { styled } from 'components/theme'
import { Text } from './Text'
import { formatTokenBalance } from '../util/conversion'
import { useTokenInfo } from '../hooks/useTokenInfo'
import { BasicNumberInput } from './BasicNumberInput'
import { GradientBackground } from 'styles/styles'

type LiquidityInputProps = {
  tokenSymbol: string
  availableAmount: number
  maxApplicableAmount: number
  amount: number
  onAmountChange: (value: number) => void
}

export const LiquidityInput: FC<LiquidityInputProps> = ({
  tokenSymbol,
  availableAmount,
  maxApplicableAmount,
  amount,
  onAmountChange,
}) => {
  const [focusedOnInput, setFocusedOnInput] = useState(false)

  const { name: tokenName, logoURI } = useTokenInfo(tokenSymbol)

  const handleAmountChange = (value: number) => onAmountChange(value)

  return (
    <StyledDivForWrapper active={focusedOnInput}>
      <StyledDivForColumn kind="info">
        <StyledImageForToken src={logoURI} as={logoURI ? 'img' : 'div'} />
        <div>
          <Text variant="title" transform="uppercase">
            {tokenName}
          </Text>
          <Text variant="caption" color="tertiary">
            {formatTokenBalance(availableAmount)} available
          </Text>
        </div>
      </StyledDivForColumn>
      <StyledDivForColumn kind="input">
        <BasicNumberInput
          value={Number(formatTokenBalance(amount))}
          min={0}
          max={maxApplicableAmount}
          onChange={handleAmountChange}
          onFocus={() => {
            setFocusedOnInput(true)
          }}
          onBlur={() => {
            setFocusedOnInput(false)
          }}
        />
      </StyledDivForColumn>
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled(GradientBackground, {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '20px',
  padding: '12px 24px 10px 10px',
  width: '100%',
  transition: 'background 0.1s ease-out',
  '&:hover': {
    backgroundColor: 'rgba(25, 29, 32, 0.15)',
  },
  '&:active': {
    backgroundColor: 'rgba(25, 29, 32, 0.05)',
  },
  variants: {
    active: {
      true: {
        backgroundColor: 'rgba(25, 29, 32, 0.05) !important',
      },
    },
  },
  '&:before': {
    borderRadius: '20px',
  },
})

const StyledDivForColumn = styled('div', {
  variants: {
    kind: {
      info: {
        display: 'flex',
        columnGap: '12px',
        textAlign: 'left',
      },
      input: {
        textAlign: 'right',
        color: 'rgba(255,255,255,0.6)',
      },
    },
  },
})

const StyledImageForToken = styled('img', {
  width: 30,
  height: 30,
  borderRadius: '50%',
  backgroundColor: '#ccc',
})

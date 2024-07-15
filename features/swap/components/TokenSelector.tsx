import mergeRefs from 'react-merge-refs'
import { getTokenBalance } from 'hooks/useTokenBalance'
import { useNearDollarValue } from 'hooks/useTokenDollarValue'
import styled from 'styled-components'
import { IconWrapper } from 'components/IconWrapper'
import React, { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { TokenOptionsList } from './TokenOptionsList'
import { Union } from 'icons/Union'
import { useOnClickOutside } from 'hooks/useOnClickOutside'
import { SelectorToggle } from './SelectorToggle'
import { SelectorInput } from './SelectorInput'
import { ConvenienceBalanceButtons } from './ConvenienceBalanceButtons'
import { useIsInteracted } from 'hooks/useIsInteracted'
import { formatTokenBalance } from '../../../util/conversion'
import { GradientBackground } from 'styles/styles'
import { isMobile } from 'util/device'

type TokenSelectorProps = {
  readOnly?: boolean
  disabled?: boolean
  amount: number
  tokenSymbol: string
  tokenAddress: string
  balance: number
  isDeposit: boolean
  onChange?: (token: { tokenSymbol; tokenAddress; amount; balance }) => void
}

export const TokenSelector = ({
  readOnly,
  disabled,
  tokenSymbol,
  tokenAddress,
  amount,
  onChange,
  balance,
  isDeposit,
}: TokenSelectorProps) => {
  const wrapperRef = useRef<HTMLDivElement>()
  const inputRef = useRef<HTMLInputElement>()
  const NearValue = useNearDollarValue()
  const tokenValues = useSelector((state: any) => state.uiData.token_value)
  const [refForInput, { isFocused: isInputFocused }] = useIsInteracted()

  const [isTokenListShowing, setTokenListShowing] = useState(false)

  useOnClickOutside(wrapperRef, () => {
    setTokenListShowing(false)
  })

  const balanceInUsd =
    tokenSymbol === 'NEAR'
      ? NearValue * balance
      : tokenValues[tokenAddress] * NearValue * balance
  const formattedAvailableAmount = formatTokenBalance(balanceInUsd, {
    includeCommaSeparation: true,
  })
  const handleAmountChange = (amount) => {
    onChange({ tokenSymbol, tokenAddress, amount, balance })
  }

  return (
    <StyledDivForContainer
      ref={wrapperRef}
      isFirst={!readOnly}
      isOpened={isTokenListShowing}
    >
      <StyledDivForWrapper>
        <StyledDivForSelector>
          <SelectorToggle
            availableAmount={balance}
            tokenSymbol={tokenSymbol}
            isSelecting={isTokenListShowing}
            onToggle={
              !disabled
                ? () => setTokenListShowing((isShowing) => !isShowing)
                : undefined
            }
          />
          {!isTokenListShowing && tokenSymbol && !readOnly && (
            <ConvenienceBalanceButtons
              disabled={balance <= 0}
              tokenSymbol={tokenSymbol}
              availableAmount={balance}
              onChange={!disabled ? handleAmountChange : () => {}}
            />
          )}
        </StyledDivForSelector>
        <StyledDivForAmountWrapper>
          {isTokenListShowing && (
            <IconWrapper
              type="button"
              onClick={() => setTokenListShowing(false)}
              icon={<Union />}
            />
          )}
          {!isTokenListShowing && (
            <ColumnFlex>
              {!isMobile() && <Text>balance: ${formattedAvailableAmount}</Text>}
              <SelectorInput
                inputRef={mergeRefs([inputRef, refForInput])}
                amount={amount}
                disabled={!tokenSymbol || readOnly || disabled}
                onAmountChange={handleAmountChange}
              />
            </ColumnFlex>
          )}
        </StyledDivForAmountWrapper>
        <StyledDivForOverlay
          interactive={readOnly ? false : !isInputFocused}
          onClick={() => {
            if (!readOnly) {
              if (isTokenListShowing) {
                setTokenListShowing(false)
              } else {
                inputRef.current?.focus()
              }
            }
          }}
        />
      </StyledDivForWrapper>
      {isTokenListShowing && (
        <StyledDivForTokensListWrapper>
          <TokenOptionsList
            activeTokenSymbol={tokenSymbol}
            isDeposit={isDeposit}
            onSelect={(selectedTokenSymbol, selectedTokenAddress) => {
              onChange({
                tokenSymbol: selectedTokenSymbol,
                tokenAddress: selectedTokenAddress,
                amount,
                balance,
              })
              setTokenListShowing(false)
            }}
          />
        </StyledDivForTokensListWrapper>
      )}
    </StyledDivForContainer>
  )
}

const StyledDivForWrapper = styled.div`
  padding: 10px 30px 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 0;
  min-height: 64px;
  @media (max-width: 650px) {
    padding: 10px 10px;
  }
`

const ColumnFlex = styled.div`
  display: flex;
  flex-direction: column;
  text-align: -webkit-right;
  justify-content: space-between;
  row-gap: 20px;
`

const Text = styled.div`
  font-size: 22px;
  color: white;
  opacity: 0.6;
  font-family: Trajan;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`

const StyledDivForSelector = styled.div`
  display: flex;
  align-items: center;
  z-index: 1;
`

const StyledDivForAmountWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  z-index: 1;
`

const StyledDivForTokensListWrapper = styled.div`
  padding: 2px 12px 24px;
  overflow: auto;
  max-height: 300px;
  ::-webkit-scrollbar {
    width: 0px;
  }
`

const StyledDivForOverlay = styled.div<{ interactive: boolean }>`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: 20px;
  transition: background-color 0.1s ease-out;
  ${({ interactive }) => {
    interactive &&
      `
    cursor: pointer;
    &: hover {
      background-color: rgba(25, 29, 32, 0.05);
    }
    
    `
  }}
`

const StyledDivForContainer = styled(GradientBackground)<{
  isFirst: boolean
  isOpened: boolean
}>`
  border-radius: 20px;
  padding: 0 20px;
  color: white;
  z-index: ${({ isFirst, isOpened }) =>
    isFirst ? (isOpened ? '102' : '2') : '1'};
  ${({ isOpened }) => isOpened && 'background: rgb(24,27,42)'};
  &:before {
    border-radius: 20px;
  }
  @media (max-width: 850px) {
    padding: 0;
  }
`

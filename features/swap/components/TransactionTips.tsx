import { IconWrapper } from '../../../components/IconWrapper'
import { Exchange } from '../../../icons/Exchange'
import React, { useState } from 'react'
import styled from 'styled-components'
import { useRecoilValue } from 'recoil'
import { tokenSwapAtom } from '../swapAtoms'
// import { useTxRates } from '../hooks/useTxRates'

type TransactionTipsProps = {
  isPriceLoading?: boolean
  tokenToTokenPrice?: number
  onTokenSwaps: () => void
  disabled?: boolean
}

export const TransactionTips = ({
  isPriceLoading,
  tokenToTokenPrice,
  onTokenSwaps,
  disabled,
}: TransactionTipsProps) => {
  const [swappedPosition, setSwappedPositions] = useState(false)
  const [tokenA, tokenB] = useRecoilValue(tokenSwapAtom)
  return (
    <StyledDivForWrapper>
      <StyledDivForRateWrapper>
        <StyledIconWrapper
          type="button"
          size="40px"
          color="#FFFFFF"
          icon={<Exchange width="30px" />}
          flipped={swappedPosition}
          onClick={
            !disabled
              ? () => {
                  setSwappedPositions(!swappedPosition)
                  onTokenSwaps()
                }
              : undefined
          }
        />
      </StyledDivForRateWrapper>
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled.div`
  text-align: -webkit-center;
  z-index: 100;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`

const StyledDivForRateWrapper = styled.div`
  background: #ffffff;
  backdrop-filter: blur(40px);
  border-radius: 20px;
  transform: rotate(-45deg);
  border: 1px solid rgba(255, 255, 255, 0.23);
  width: 77px;
  height: 77px;
  z-index: 10;
  display: flex;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(109, 109, 120, 0.47);
  justify-content: center;
  align-items: center;
  @media (max-width: 1550px) {
    width: 60px;
    height: 60px;
  }
  @media (max-width: 650px) {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }
`

const StyledIconWrapper = styled(IconWrapper)`
  stroke: #000000;
  transform: rotate(45deg);
  width: 30px;
`

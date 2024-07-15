import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import styled from 'styled-components'
import { getRewardByTokenId } from 'util/farm'
import { toReadableNumber } from 'util/numbers'
import { Button } from 'components/Button'
import { formatTokenBalance } from 'util/conversion'
import { withdrawReward } from 'util/m-token'
import { rewardToken } from 'util/constants'
import { GradientBackground } from 'styles/styles'

export const RewardCard: React.FC = ({}) => {
  const [reward, setReward] = useState('0')
  const rewardToken = 'dust.cmdev0.testnet'
  const REWARD_TOKEN_DECIMAL = 8
  const nearPrice = useSelector((state: any) => state.coinData.near_value)
  const dustPriceInNear = useSelector(
    (state: any) => state.uiData.token_value[rewardToken]
  )
  const dustPrice = dustPriceInNear * nearPrice

  useEffect(() => {
    getRewardByTokenId(rewardToken).then((reward) => {
      setReward(reward)
    })
  }, [])

  const withdraw = () => {
    withdrawReward({ token_id: rewardToken, amount: reward })
  }

  return (
    <StyledElementForCard>
      <StyledHeader>My reward</StyledHeader>
      <StyledRewardWrapper>
        <StyledDust>{`${toReadableNumber(
          REWARD_TOKEN_DECIMAL,
          reward
        )} DUST`}</StyledDust>
        <StyledDollar>{`$${formatTokenBalance(
          dustPrice * Number(toReadableNumber(REWARD_TOKEN_DECIMAL, reward))
        )}`}</StyledDollar>
      </StyledRewardWrapper>
      <StyledButtonWrapper>
        <PrimaryButton onClick={withdraw}>Withdraw</PrimaryButton>
      </StyledButtonWrapper>
    </StyledElementForCard>
  )
}

const StyledHeader = styled.div`
  font-size: 16px;
  font-weight: 500;
  font-family: Trajan;
`
const StyledDollar = styled.div`
  font-size: 20px;
  padding-top: 10px;
  font-weight: 700;
`
const StyledDust = styled.div`
  font-family: Trajan;
  font-size: 16px;
`

const StyledElementForCard = styled(GradientBackground)`
  display: flex;
  flex-direction: row;
  padding: 20px 24px;
  margin-bottom: 10px;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  position: relative;
  overflow: hidden;
  &:before {
    border-radius: 20px;
  }
  @media (max-width: 650px) {
    padding: 20px 5px;
  }
`

const StyledRewardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`
const StyledButtonWrapper = styled.div`
  @media (max-width: 650px) {
    width: 100%;
  }
`
const PrimaryButton = styled(GradientBackground).attrs({ as: Button })`
  /* Note: backdrop-filter has minimal browser support */
  font-family: Trajan;
  font-size: 16px;
  font-weight: 500;
  &:before {
    border-radius: 10px;
  }
  @media (max-width: 650px) {
    width: 100%;
    margin-top: 20px;
  }
`

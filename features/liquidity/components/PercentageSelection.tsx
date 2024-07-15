import styled from 'styled-components'

type PercentageSelectionProps = {
  maxLiquidity: number
  liquidity: number
  onChangeLiquidity: (liquidity: number) => void
}

export const PercentageSelection = ({
  liquidity,
  onChangeLiquidity,
  maxLiquidity,
}: PercentageSelectionProps): JSX.Element => {
  const valuesForSteps = [0.1, 0.25, 0.5, 0.75, 1]
  const percentage = liquidity / maxLiquidity
  return (
    <StyledDivForGrid>
      {valuesForSteps.map((valueForStep) => {
        return (
          <SecondaryButton
            active={Number(percentage.toFixed(4)) === valueForStep}
            key={valueForStep}
            onClick={() => {
              onChangeLiquidity(valueForStep * maxLiquidity)
            }}
          >
            {valueForStep * 100}%
          </SecondaryButton>
        )
      })}
    </StyledDivForGrid>
  )
}

const StyledDivForGrid = styled.div`
  display: flex;
  color: black;
  justify-content: space-around;
  width: 100%;
  padding: 25px 0;
  @media (max-width: 1550px) {
    padding: 15px 0;
  }
`

const SecondaryButton = styled.button<{ active: boolean }>`
  width: 50px;
  height: 27px;
  color: ${({ active }) => (active ? 'black' : 'white')};
  background: ${({ active }) => (active ? 'white' : '')};
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
`

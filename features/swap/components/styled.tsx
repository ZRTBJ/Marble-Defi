import styled from 'styled-components'
import { GradientBackground } from 'styles/styles'

export const TokenRateWrapper = styled.div`
  padding: 0 80px;
  font-size: 20px;
  height: 52px;
  align-items: center;
  display: flex;
  font-family: Trajan;
  @media (max-width: 1550px) {
    padding: 0 20px;
    font-size: 16px;
  }
`
export const StyledDivForInfo = styled(GradientBackground)`
  &:before {
    border-radius: 20px;
  }
  display: flex;
  align-items: center;
  padding: 15px;
  justify-content: space-between;
`

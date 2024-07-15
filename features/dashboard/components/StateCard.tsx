import styled from 'styled-components'
import { GradientBackground, SecondGradientBackground } from 'styles/styles'

const StyledCard = ({ icon, color, title, value }) => {
  return (
    <Container>
      <IconWrapper color={color}>{icon}</IconWrapper>
      <div>
        {title}
        {value}
      </div>
    </Container>
  )
}

const Container = styled(GradientBackground)`
  padding: 14px;
  display: flex;
  @media (max-width: 1550px) {
    padding: 10px;
  }
  &:before {
    border-radius: 20px;
  }
`

const IconWrapper = styled.div<{ color: string }>`
  border-radius: 20px;
  width: 60px;
  height: 60px;
  background: ${({ color }) => color};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
  @media (max-width: 1550px) {
    width: 48px;
    height: 48px;
    border-radius: 15px;
  }
`
export default StyledCard

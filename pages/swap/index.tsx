import React from 'react'
import { AppLayout } from 'components/Layout/AppLayout'
import { TokenSwap } from 'features/swap'
import { PageHeader } from 'components/Layout/PageHeader'
import styled from 'styled-components'

const Swap = () => {
  const [fullWidth, setFullWidth] = React.useState(true)
  return (
    <AppLayout fullWidth={fullWidth}>
      <Container>
        <Header>
          <h1>Swap</h1>
          <p>Swap between your favorite assets on Marble</p>
        </Header>
        <StyledDivForWrapper>
          <TokenSwap />
        </StyledDivForWrapper>
      </Container>
    </AppLayout>
  )
}
export default Swap
const Container = styled.div`
  padding: 20px 60px 0px 60px;
  // height: 100%;
  @media (max-width: 1550px) {
    padding: 20px 40px 0px 40px;
  }
  @media (max-width: 650px) {
    padding-inline: 0px;
  }
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`
const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  h1 {
    font-size: 45px;
    font-weight: 700;
    font-family: Trajan;
  }
  p {
    font-size: 24px;
    font-weight: 400;
    font-family: Trajan;
  }
  @media (max-width: 1550px) {
    margin-bottom: 0px;
    p {
      font-size: 14px;
    }
  }
  @media (max-width: 650px) {
    h1 {
      font-size: 35px;
      font-weight: 700;
      font-family: Trajan;
    }
    p {
      font-size: 18px;
      font-weight: 400;
      font-family: Trajan;
    }
  }
`
const StyledDivForWrapper = styled.div`
  overflow: auto;
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: white;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }

  padding: 0 10px;
`

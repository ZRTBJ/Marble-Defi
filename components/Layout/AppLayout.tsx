import styled from 'styled-components'
import { NavigationSidebar } from './NavigationSidebar'
import FixedNavigationSidebar from './FixedNavigationSidebar'
import { FooterBar } from './FooterBar'
import { useEffect, useState } from 'react'
import TagManager from 'react-gtm-module'
import { ChakraProvider, HStack, Stack } from '@chakra-ui/react'
import { FetchCoinInfo } from 'hooks/useTokenBalance'
import { isPC } from 'util/device'
import { SecondGradientBackground } from 'styles/styles'
// import { useDb } from 'hooks/useDb'

const tagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
}

//TagManager.initialize(tagManagerArgs)

export const AppLayout = ({
  footerBar = <FooterBar />,
  children,
  fullWidth = true,
}) => {
  FetchCoinInfo()
  // useDb()
  useEffect(() => {
    TagManager.initialize(tagManagerArgs)
  }, [])
  const getBadgeInfo = () => {
    // if (!accountId)
    //   return (
    //     <>
    //       <span>AIRDROP</span>: Please connect your wallet to evaluate your
    //       status.{' '}
    //     </>
    //   )
    // let createdDate = profile.createdAt
    //   ? new Date(profile.createdAt).getTime()
    //   : Date.now()
    // let standardDate = new Date(2023, 1, 1).getTime()
    // if (createdDate < standardDate) {
    //   return (
    //     <>
    //       <span>AIRDROP</span>: You are eligible! &nbsp;
    //       <span>Provide your &quot;.near&quot;wallet</span>
    //       <div>Edit your username</div>
    //     </>
    //   )
    // }
    // return (
    //   <>
    //     <span>AIRDROP</span>: You are not eligible!{' '}
    //   </>
    // )
    return (
      <>
        <span>AIRDROP is Live</span>
        <a href="https://near-nft.marbledao.finance" target="__blank">
          <div>Go to Near marketplace</div>
        </a>
      </>
    )
  }
  return (
    <ChakraProvider>
      <BadgeWrapper>{getBadgeInfo()}</BadgeWrapper>
      <StyledWrapper>
        {isPC() ? <NavigationSidebar /> : <FixedNavigationSidebar />}

        <StyledContainer>{children}</StyledContainer>
      </StyledWrapper>
    </ChakraProvider>
  )
}

const StyledWrapper = styled.div`
  display: flex;
  column-gap: 20px;
  /* background-image: url('/images/background.jpg');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover; */
  background: rgb(24, 27, 42);
  position: relative;
  color: white;
  padding: 90px;
  min-height: 100vh;

  * {
    font-family: Trajan;
  }
  @media (max-width: 1550px) {
    padding: 90px;
  }
  @media (max-width: 1024px) {
    padding-top: 100px;
  }
  @media (max-width: 650px) {
    padding: 80px 10px;
  }
`

const StyledContainer = styled(SecondGradientBackground)`
  &:before {
    border-radius: 30px;
  }
  width: 100%;
  @media (max-width: 1024px) {
    margin-inline: 0 !important;
  }
`
const BadgeWrapper = styled.div`
  position: fixed;
  top: 0;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(45deg, #eb5d47 0%, #a933b2 50%, #a4f9ff 100%);
  box-shadow: 0px 0px 40px rgba(0, 0, 0, 0.6);
  width: 100%;
  z-index: 100;
  font-family: Mulish;
  color: white;
  span {
    font-weight: bold;
    font-family: Mulish;
  }
  div {
    background: white;
    border-radius: 8px;
    height: 26px;
    color: black;
    font-family: Mulish;
    padding-inline: 5px;
    margin-inline: 20px;
    font-weight: bold;
    cursor: pointer;
  }
`

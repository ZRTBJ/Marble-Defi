import React from 'react'
import styled from 'styled-components'
import { Text } from '../Text'
import Head from 'next/head'
import { APP_NAME } from '../../util/constants'

export const PageHeader = ({ title, subtitle, align = 'center' }) => {
  return (
    <HeaderWrapper>
      <Head>
        <title>
          {APP_NAME} — {title}
        </title>
      </Head>
      <Text
        variant="header"
        className={`page-title ${title == 'NFT' ? 'nft-title' : ''}`}
        css={{
          fontSize: '$12',
          lineHeight: '$5',
          textAlign: `${align}`,
          color: '#FFFFFF',
          fontFamily: 'Trajan',
        }}
      >
        {title}
      </Text>
      {subtitle != '' && (
        <Text
          variant="body"
          className="page-subtitle"
          css={{
            paddingTop: '1.5rem',
            paddingBottom: '1rem',
            fontSize: '$8',
            textAlign: 'center',
            maxWidth: '970px',
            margin: '0 auto',
            color: 'white',
          }}
        >
          {subtitle}
        </Text>
      )}
    </HeaderWrapper>
  )
}

const HeaderWrapper = styled.div`
  padding-top: 70px;
  @media (max-width: 1550px) {
    padding-top: 30px;
  }
`
const Header = styled.div`
  font-size: ;
`

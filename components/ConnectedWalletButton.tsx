import React, { useState, useEffect } from 'react'
import { styled } from 'components/theme'
import { Text } from './Text'
import { useBaseTokenInfo } from '../hooks/useTokenInfo'
import { getTokenBalance } from '../hooks/useTokenBalance'
import { formatTokenBalance } from '../util/conversion'
import { CSS } from '@stitches/react'

type ConnectedWalletButtonProps = { css?: CSS } & {
  walletName?: string
  onConnect: () => void
  onDisconnect: () => void
  connected: boolean
}

export const ConnectedWalletButton = ({
  onConnect,
  connected,
  onDisconnect,
  walletName,
}: ConnectedWalletButtonProps) => {
  const baseToken = useBaseTokenInfo()
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    // setBalance(0)
    getTokenBalance(baseToken).then((balance) => {
      setBalance(balance)
    })
  }, [baseToken])

  if (!connected) {
    return (
      <ConnectWalletContainer onClick={onConnect}>
        <span>Connect Wallet</span>
      </ConnectWalletContainer>
    )
  }

  return (
    <ConnectWalletContainer onClick={onDisconnect}>
      <Text
        variant="link"
        css={{
          '-webkit-background-clip': 'text',
          color: '$white',
        }}
      >
        {walletName}
      </Text>
      <Text
        variant="legend"
        css={{
          '-webkit-background-clip': 'text',
          color: '$white',
        }}
      >
        {formatTokenBalance(balance, { includeCommaSeparation: true })}{' '}
        {baseToken?.symbol}
      </Text>
    </ConnectWalletContainer>
  )
}

const ConnectWalletContainer = styled('div', {
  position: 'relative',
  cursor: 'pointer',
  display: 'flex',
  width: '176px',
  height: '52px',
  alignItems: 'center',
  textAlign: 'center',
  fontSize: '18px',
  border: '1px solid #FFFFFF',
  boxShadow: 'inset 0px 4px 6px rgba(0, 0, 0, 0.25)',
  filter: 'drop-shadow(0px 4px 18px rgba(0, 0, 0, 0.15))',
  borderRadius: '20px',
  fontWeight: '600',
  flexDirection: 'column',
  justifyContent: 'center',
  color: 'white',
  '&:hover': {
    opacity: '0.6',
  },
})

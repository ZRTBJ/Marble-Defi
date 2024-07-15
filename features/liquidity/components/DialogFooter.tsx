import { styled } from 'components/theme'
import { Text } from '../../../components/Text'
import { ReactNode } from 'react'

type DialogFooterProps = {
  title?: ReactNode | string
  text?: ReactNode | string
  buttons: ReactNode | string
}

export const DialogFooter = ({ title, text, buttons }: DialogFooterProps) => {
  return (
    <StyledDivForFooter>
      {title && (
        <Text
          variant="body"
          css={{
            paddingBottom: '$4',
            textAlign: 'left',
            fontSize: '14px',
            fontFamily: 'Trajan',
          }}
        >
          {title}
        </Text>
      )}

      {text && (
        <Text
          variant="body"
          css={{ paddingBottom: '$12', textAlign: 'left', fontSize: '14px' }}
        >
          {text}
        </Text>
      )}
      <StyledGridForButtons>{buttons}</StyledGridForButtons>
    </StyledDivForFooter>
  )
}

const StyledDivForFooter = styled('div', {
  padding: '$8 0 $4',
})

const StyledGridForButtons = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  columnGap: '$space$4',
})

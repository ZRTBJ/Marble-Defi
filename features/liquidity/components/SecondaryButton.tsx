import { styled } from 'components/theme'
import { Button } from '../../../components/Button'
import type { ButtonProps } from './PrimaryButton'
import { ButtonSize } from './PrimaryButton'
import { ReactNode } from 'react'
import { IconWrapper } from '../../../components/IconWrapper'

export const SecondaryButton = ({
  children,
  size = ButtonSize.medium,
  iconBefore,
  iconAfter,
  ...props
}: ButtonProps & {
  active?: boolean
  iconBefore?: ReactNode
  iconAfter?: ReactNode
}) => {
  return (
    <StyledButton variant="secondary" size={size} {...(props as any)}>
      {iconBefore && (
        <IconWrapper size="16px" icon={iconBefore} color="secondaryText" />
      )}
      <Text>{children}</Text>
      {iconAfter && (
        <IconWrapper size="16px" icon={iconAfter} color="secondaryText" />
      )}
    </StyledButton>
  )
}

const StyledButton = styled(Button, {
  padding: '8px 16px',
  columnGap: 8,
  display: 'flex',
  alignItems: 'center',
  width: '140px',
  variants: {
    active: {
      true: {
        backgroundColor: 'white',
        color: 'black',
      },
      false: {
        backgroundColor: '#51525E',
        color: '#A1A1A1',
      },
    },
    size: {
      [ButtonSize.medium]: {
        padding: '11px 24px',
        borderRadius: '16px',
      },
      small: {
        padding: '11px 8px',
        borderRadius: '20px',
      },
      Forbond: {
        padding: '11px 24px',
        borderRadius: '20px',
      },
    },
  },
})
const Text = styled('div', {
  fontSize: '16px',
  fontWeight: '500',
  fontFamily: 'Trajan',
})

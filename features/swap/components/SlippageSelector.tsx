import { styled } from 'components/theme'
import { Text } from '../../../components/Text'
import { IconWrapper } from '../../../components/IconWrapper'
import { Chevron } from '../../../icons/Chevron'
import { useRef, useState } from 'react'
import { colorTokens, SLIPPAGE_OPTIONS } from '../../../util/constants'
import { useOnClickOutside } from '../../../hooks/useOnClickOutside'

type SlippageSelectorProps = {
  slippage: number
  onSlippageChange: (slippage: number) => void
}
export const SlippageSelector = ({
  slippage = 0.01,
  onSlippageChange,
}: SlippageSelectorProps) => {
  const [isShowingSettings, setShowingSettings] = useState(false)

  const refForWrapper = useRef()
  useOnClickOutside(refForWrapper, () => {
    setShowingSettings(false)
  })

  return (
    <StyledDivForWrapper ref={refForWrapper}>
      <StyledDivForSelector
        active={isShowingSettings}
        onClick={() => {
          setShowingSettings(!isShowingSettings)
        }}
      >
        <Title>Slippage {slippage * 100}%</Title>
        <IconWrapper
          size="16px"
          color="white"
          icon={<Chevron />}
          rotation={isShowingSettings ? '90deg' : '-90deg'}
        />
      </StyledDivForSelector>
      {isShowingSettings && (
        <StyledDivForPopover>
          <p>
            Your transaction will not complete if price slips below target
            threshold.
          </p>
          <StyledDivForSlippageList>
            {SLIPPAGE_OPTIONS.map((tolerance) => (
              <StyledButton
                active={slippage === tolerance}
                key={tolerance}
                onClick={() => {
                  onSlippageChange(tolerance)
                  setShowingSettings(false)
                }}
              >
                <Text variant="body">{tolerance * 100}%</Text>
              </StyledButton>
            ))}
          </StyledDivForSlippageList>
        </StyledDivForPopover>
      )}
    </StyledDivForWrapper>
  )
}

const StyledDivForWrapper = styled('div', {
  position: 'relative',
  borderRight: '1px solid white',
  width: 'fit-content',
  '@media (max-width: 650px)': {
    borderRight: 'none',
  },
})

const StyledDivForSelector = styled('button', {
  textTransform: 'uppercase',
  display: 'flex',
  columnGap: '$space$4',
  padding: '16px 40px 16px 24px',
  userSelect: 'none',
  borderRadius: '18px',
  transition: 'background-color .1s ease-out',
  '&:hover': {
    backgroundColor: '$colors$dark15',
  },
  '&:active': {
    backgroundColor: '$colors$dark5',
  },
  alignItems: 'center',
  variants: {
    active: {
      true: {},
      false: {
        // backgroundColor: '$colors$dark10',
      },
    },
  },
  '@media (max-width: 650px)': {
    padding: '10px',
  },
})

const StyledDivForPopover = styled('div', {
  textTransform: 'none',
  backgroundColor: 'rgba(5,6,22)',
  padding: '$7',
  position: 'absolute',
  backdropFilter: 'blue(40px)',
  // bottom: 'calc(100% + 4px)',
  left: 0,
  top: '60px',
  borderRadius: '$1',
  display: 'flex',
  flexDirection: 'column',
  rowGap: '13px',
  border: '1px solid rgba(25, 29, 32, 0.25)',
  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  ' p': {
    fontFamily: 'Mulish',
  },
})

const StyledDivForSlippageList = styled('div', {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
})

const StyledButton = styled('button', {
  borderRadius: '$1',
  padding: '$4 $8',
  color: colorTokens.secondaryText,
  transition: 'background-color .1s ease-out',
  variants: {
    active: {
      true: {
        //backgroundColor: '$dark10',
      },
      false: {
        //backgroundColor: '$dark0',
      },
    },
  },
  '&:hover': {
    backgroundColor: 'gray',
  },
  '&:active': {
    backgroundColor: '$dark5',
  },
})
const Title = styled('div', {
  fontSize: '24px',
  fontFamily: 'Trajan',
  '@media (max-width: 1550px)': {
    fontSize: '20px',
  },
  '@media (max-width: 650px)': {
    fontSize: '15px',
  },
})

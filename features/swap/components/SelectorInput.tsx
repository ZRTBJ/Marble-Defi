import React, { Ref } from 'react'
import { Text } from 'components/Text'
import styled from 'styled-components'
import { useAmountChangeController } from 'hooks/useAmountChangeController'

type SelectorInputProps = {
  amount: number
  disabled: boolean
  onAmountChange: (amount: number) => void
  inputRef?: Ref<HTMLInputElement>
}

export const SelectorInput = ({
  amount,
  disabled,
  onAmountChange,
  inputRef,
}: SelectorInputProps) => {
  const { value, setValue } = useAmountChangeController({
    amount,
    onAmountChange,
  })

  return (
    <Text css={{ fontWeight: '$bold' }}>
      <StyledInput
        ref={inputRef}
        type="number"
        lang="en-US"
        placeholder="0.0"
        min={0}
        value={value}
        onChange={
          !disabled ? ({ target: { value } }) => setValue(value) : undefined
        }
        autoComplete="off"
        readOnly={disabled}
        style={{ maxWidth: `${value.length + 1}ch`, width: '100%' }}
      />
    </Text>
  )
}

const StyledInput = styled.input`
  width: auto;
  text-align: right;
  font-size: 30px;
  @media (max-width: 1550px) {
    font-size: 20px;
  }
  @media (max-width: 650px) {
    font-size: 12px;
  }
`

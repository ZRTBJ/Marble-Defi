import Portal from '@reach/portal'
import gsap from 'gsap'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

type DialogProps = {
  children: ReactNode
  isShowing: boolean
  onRequestClose: () => void
  kind?: 'blank'
  width?: 'normal' | 'large'
}

const paddingX = 18

export const Dialog = ({
  children,
  isShowing,
  onRequestClose,
  kind,
  ...props
}: DialogProps) => {
  const [isRenderingDialog, setIsRenderingDialog] = useState(false)
  const modalRef = useRef()
  const overlayRef = useRef()

  // render the dialog
  useEffect(() => {
    if (isShowing) {
      setIsRenderingDialog(true)
    }
  }, [isShowing])

  useEffect(() => {
    const shouldAnimateCloseOut = !isShowing && isRenderingDialog

    const tl = gsap.timeline({
      duration: 0.35,
      ease: 'power.easeOut',
    })

    if (shouldAnimateCloseOut) {
      tl.to(modalRef.current, { opacity: 0 }, 0)
      tl.to(
        overlayRef.current,
        {
          opacity: 0,
          onComplete() {
            // unmount the dialog
            setIsRenderingDialog(false)
          },
        },
        0
      )
    }

    if (isShowing && isRenderingDialog) {
      tl.to(overlayRef.current, { opacity: 0.6 }, 0)
      tl.to(modalRef.current, { opacity: 1 }, 0.1)
      return
    }
  }, [isRenderingDialog, isShowing])

  return (
    <Portal>
      {(isShowing || isRenderingDialog) && (
        <>
          <StyledDivForModal ref={modalRef} {...props}>
            {kind !== 'blank' && (
              <StyledCloseIcon offset={paddingX} onClick={onRequestClose} />
            )}
            {children}
          </StyledDivForModal>
          <StyledDivForOverlay
            role="presentation"
            onClick={onRequestClose}
            ref={overlayRef}
          />
        </>
      )}
    </Portal>
  )
}

export const DialogBody = styled.div`
  padding: ${paddingX}px;
`

const StyledDivForModal = styled.div`
  opacity: 0;
  max-width: 492px;
  width: 90%;
  position: absolute;
  z-index: 99;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: rgb(49, 49, 56);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  text-align: -webkit-center;
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  padding-top: 20px;
`

const StyledDivForOverlay = styled.div`
  opacity: 0;
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 98;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.26);
  backdrop-filter: blur(4px);
`

const CloseIcon = (props) => (
  <svg
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
      fill="currentColor"
    />
  </svg>
)

export const StyledCloseIcon = styled(CloseIcon)`
  width: ${(p) => p.size || '40px'};
  height: ${(p) => p.size || '40px'};
  color: #323232;
  display: block;
  transition: opacity 0.15s ease-out;
  cursor: pointer;
  border-radius: 50%;
  background: white;
  margin-left: auto;
  margin-right: ${(p) => p.offset}px;
  margin-top: ${(p) => p.offset}px;
  &:hover {
    opacity: 0.75;
  }
  position: absolute;
  right: -30px;
  top: -30px;
`

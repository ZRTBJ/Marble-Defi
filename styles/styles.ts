import styled from 'styled-components'

export const GradientBackground = styled.div`
  background: transparent;
  position: relative;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border: 1px solid;
    border-image: linear-gradient(
      90.65deg,
      #ffffff 0.82%,
      rgba(0, 0, 0, 0) 98.47%
    );
    background: linear-gradient(0deg, #050616, #050616) padding-box,
      linear-gradient(90.65deg, #ffffff 0.82%, rgba(0, 0, 0, 0) 98.47%)
        border-box;
    backdrop-filter: blur(20px);
    box-shadow: 0px 4px 40px 0px #2a2f3217, 0px 7px 24px 0px #6d6d78 inset;
    opacity: 0.2;
    z-index: -1;
  }
`
export const SecondGradientBackground = styled.div`
  position: relative;
  z-index: 9 !important;

  &::before {
    content: '';
    box-shadow: 0px 4px 40px rgb(42 47 50 / 9%), inset -2px -1px 24px #41414e;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    inset: 0;
    padding: 1px;
    opacity: 0.7;

    background: linear-gradient(0deg, #191c2b, #272938) padding-box,
      linear-gradient(90.65deg, #6c6c6c 0.82%, rgba(0, 0, 0, 0) 65.47%)
        border-box;
    border: 1px solid;
    border-image-source: linear-gradient(
      90.65deg,
      #ffffff 0.82%,
      rgba(0, 0, 0, 0) 98.47%
    );
  }
`

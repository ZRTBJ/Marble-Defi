import { SVGProps } from 'react'

export const Marketplace = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width="12"
      height="18"
      viewBox="0 0 12 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.70756 1.54166L1.59089 5.42499C0.882558 6.30833 1.13256 7.44166 2.14089 7.94166L5.24923 9.49999C5.65756 9.69999 6.32422 9.69999 6.73256 9.49999L9.84089 7.94166C10.8492 7.43333 11.0992 6.29999 10.3909 5.42499L7.28256 1.54166C6.58256 0.649993 5.41589 0.649993 4.70756 1.54166Z"
        strokeWidth="0.8"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.stroke || 'white'}
      />
      <path
        d="M6 0.916656V5.29999"
        strokeWidth="0.8"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.stroke || 'white'}
      />
      <path
        d="M2.5 7.92499L6 5.29999L9.5 7.92499"
        strokeWidth="0.8"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.stroke || 'white'}
      />
      <path
        d="M3.3068 11.025L4.64847 11.625C5.5068 12.0083 6.49013 12.0083 7.3568 11.625L8.69846 11.025C9.89846 10.4917 11.0068 11.9417 10.1735 12.9583L7.29013 16.4833C6.5818 17.35 5.42346 17.35 4.7068 16.4833L1.8318 12.9583C0.990132 11.9417 2.09847 10.4917 3.3068 11.025Z"
        strokeWidth="0.8"
        strokeMiterlimit="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.stroke || 'white'}
      />
    </svg>
  )
}

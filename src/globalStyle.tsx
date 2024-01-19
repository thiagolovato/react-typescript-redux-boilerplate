import { createGlobalStyle } from 'styled-components';
import { COLORS } from './constants/colors.ts';
import reset from 'styled-reset';
import React from 'react';
import { ExecutionProps } from 'styled-components/dist/types';

export const GlobalStyle: React.NamedExoticComponent<ExecutionProps> = createGlobalStyle`
  ${reset}

  @import url('https://fonts.googleapis.com/css?family=Open+Sans');

  html {
    box-sizing: border-box;
    font-family: 'Roboto';
    font-size: 13px;
  }

  body {
    font-family: 'Open Sans', 'sans-serif';
    background-color: ${COLORS.gray100};
    height: 100vh;
  }

  *, *:before, *:after {
    box-sizing: inherit;
    font-family: inherit;
  }
`;

import { createGlobalStyle, DefaultTheme, GlobalStyleComponent } from 'styled-components';
import { tokens } from './constants/tokens';
import reset from 'styled-reset';

export const GlobalStyle: GlobalStyleComponent<{}, DefaultTheme> = createGlobalStyle`
    ${reset}
    html {
        box-sizing: border-box;
        font-family: ${tokens.typography.fontFamily.sans};
        font-size: 16px;
    }

    #root {
        height: 100%;
        width: 100%;
    }

    body {
        font-family: ${tokens.typography.fontFamily.sans};
        height: 100%;
        width: 100%;
        background: ${tokens.gradients.accent};
        position: relative;

        &::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(
                    circle at 30% 40%,
                    ${tokens.colors.primary[100]}20 0%,
                    transparent 50%
            ),
            radial-gradient(
                    circle at 80% 20%,
                    ${tokens.colors.secondary[100]}15 0%,
                    transparent 50%
            ),
            radial-gradient(
                    circle at 40% 80%,
                    ${tokens.colors.primary[200]}10 0%,
                    transparent 50%
            );
            animation: floating 30s ease-in-out infinite;
            pointer-events: none;
            z-index: -1;
        }

        @keyframes floating {
            0%, 100% {
                transform: rotate(0deg) translate(0, 0);
            }
            25% {
                transform: rotate(0.5deg) translate(-5px, -5px);
            }
            50% {
                transform: rotate(0deg) translate(5px, -3px);
            }
            75% {
                transform: rotate(-0.5deg) translate(-3px, 5px);
            }
        }
    }

    *, *:before, *:after {
        box-sizing: inherit;
        font-family: inherit;
    }

    /* Scrollbar customization */
    ::-webkit-scrollbar {
        width: 8px;
    }

    ::-webkit-scrollbar-track {
        background: ${tokens.colors.neutral[100]};
    }

    ::-webkit-scrollbar-thumb {
        background: ${tokens.colors.primary[300]};
        border-radius: ${tokens.borderRadius.full};
    }

    ::-webkit-scrollbar-thumb:hover {
        background: ${tokens.colors.primary[400]};
    }
`;

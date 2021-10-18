import React from 'react';
import { Box, BoxProps, Icon } from 'cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
import messages from './messages';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';

const timeout = 350;

const ErrorMessageText = styled.div`
  flex: 1 1 100%;
  color: ${colors.clRedError};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;

  a {
    color: ${colors.clRedError};
    font-weight: 500;
    text-decoration: underline;

    &:hover {
      color: ${darken(0.2, colors.clRedError)};
      text-decoration: underline;
    }
  }

  strong {
    font-weight: 500;
  }
`;

const ErrorIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${colors.clRedError};
  padding: 0px;
  margin: 0px;
  margin-right: 10px;

  ${isRtl`
    margin-right: 0;
    margin-left: 10px;
  `}
`;

type TFlexibleText = string | JSX.Element;

type TErrorMessage = {
  key: keyof typeof messages;
  fieldName: TFlexibleText;
  values?: Record<string, any>;
};

function isErrorMessage(
  errorContent: TFlexibleText | TErrorMessage
): errorContent is TErrorMessage {
  return (errorContent as TErrorMessage).key !== undefined;
}

interface Props extends BoxProps {
  errorContent: TFlexibleText | TErrorMessage;
  animate?: boolean;
  showIcon?: boolean;
}

export default ({
  animate,
  errorContent,
  showIcon = true,
  ...BoxProps
}: Props) => {
  return (
    <CSSTransition
      classNames="error"
      timeout={timeout}
      in={true}
      mountOnEnter={true}
      unmountOnExit={true}
      enter={animate}
      exit={animate}
    >
      <Box role="alert" position="relative" overflow="hidden" {...BoxProps}>
        {showIcon && <ErrorIcon name="error" ariaHidden />}

        <ErrorMessageText>
          {isErrorMessage(errorContent) ? (
            messages?.[errorContent.key] ? (
              <FormattedMessage
                {...messages[errorContent.key]}
                values={{
                  fieldName: errorContent.fieldName,
                  ...errorContent.values,
                }}
              />
            ) : (
              errorContent.key
            )
          ) : (
            errorContent
          )}
        </ErrorMessageText>
      </Box>
    </CSSTransition>
  );
};

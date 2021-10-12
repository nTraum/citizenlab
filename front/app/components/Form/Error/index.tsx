import React, { PureComponent } from 'react';
import { Box, BoxProps, Icon } from 'cl2-component-library';
import CSSTransition from 'react-transition-group/CSSTransition';
import { isArray, isEmpty, uniqBy } from 'lodash-es';
import styled from 'styled-components';
import { FormattedMessage } from 'utils/cl-intl';
import { darken } from 'polished';
import { CLError, Message } from 'typings';
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

const ContainerInner = styled.div<{ showBackground: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 13px;
  border-radius: ${(props) => props.theme.borderRadius};
  background: ${colors.clRedErrorBackground};
  background: ${(props) =>
    props.showBackground ? colors.clRedErrorBackground : 'transparent'};

  ${isRtl`
    flex-direction: row-reverse;
 `}
`;

const Container = styled.div<{ marginTop: string; marginBottom: string }>`
  position: relative;
  overflow: hidden;

  ${ContainerInner} {
    margin-top: ${(props) => props.marginTop};
    margin-bottom: ${(props) => props.marginBottom};
  }

  &.error-enter {
    max-height: 0px;
    opacity: 0;

    &.error-enter-active {
      max-height: 60px;
      opacity: 1;
      transition: max-height ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1),
        opacity ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.error-exit {
    max-height: 100px;
    opacity: 1;

    &.error-exit-active {
      max-height: 0px;
      opacity: 0;
      transition: max-height ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1),
        opacity ${timeout}ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }
`;

const ErrorList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ErrorListItem = styled.li`
  display: flex;
  align-items: flex-start;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const Bullet = styled.span`
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  line-height: ${fontSizes.base}px;
  margin-right: 8px;
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
            <FormattedMessage
              {...messages[errorContent.key]}
              values={{
                fieldName: errorContent.fieldName,
                ...errorContent.values,
              }}
            />
          ) : (
            { errorContent }
          )}
        </ErrorMessageText>
      </Box>
    </CSSTransition>
  );
};

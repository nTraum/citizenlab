import React, { useEffect, ReactElement, useState } from 'react';
import { SignUpStepOutletProps } from 'utils/moduleUtils';
import { injectIntl } from 'utils/cl-intl';
import { FormattedMessage, InjectedIntlProps } from 'react-intl';
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import messages from './messages';
import Error from 'components/UI/Error';
import CodeInput from 'react-verification-code-input';
import styled from 'styled-components';
import { confirm, resendCode } from '../../services/confirmation';

import {
  FormContainer,
  Form,
  FormField,
  StyledLabel,
  LabelTextContainer,
  Footer,
} from './styles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { CLErrors, CLError } from 'typings';
import Button from 'components/UI/Button';
import { colors, fontSizes } from 'utils/styleUtils';
import Link from 'utils/cl-router/Link';
import { darken } from 'polished';
import { modifyMetaData } from 'components/SignUpIn/events';

const StyledCodeInput = styled<any>(CodeInput)`
  width: auto !important;
  margin: 24px 0 12px;

  & > div {
    display: flex !important;
    justify-content: space-between;
  }

  input {
    border-radius: 6px;
    border: 1px solid ${({ error }) => (error ? colors.clRed : colors.border)};
    height: 90px !important;
    width: 80px !important;
    font-size: 32px;
    color: ${({ theme }) => theme.colorText};

    &:last-child {
      border-right: 1px solid
        ${({ error }) => (error ? colors.clRed : colors.border)};
    }

    &:focus {
      border: 1px solid ${({ error }) => (error ? colors.clRed : colors.border)};
      caret-color: ${({ error }) => (error ? colors.clRed : colors.border)};

      & + input {
        border-left: 1px solid
          ${({ error }) => (error ? colors.clRed : colors.border)};
      }
    }
  }
`;

export const SubmitButton = styled(Button)`
  width: 100%;
`;

const FooterNotes = styled.div`
  margin: 18px 0 0;
  text-align: center;
`;

const FooterNote = styled.p`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  line-height: normal;
  margin: 0 0 12px;
`;

const FooterNoteLink = styled(Link)`
  font-size: ${fontSizes.small}px;
  padding-left: 4px;
  color: ${({ theme }) => theme.colorText};
  text-decoration: underline;

  &:hover {
    color: ${({ theme }) => darken(0.2, theme.colorText)};
    text-decoration: underline;
  }
`;

type Props = SignUpStepOutletProps & InjectedIntlProps;

function ConfirmationSignupStep({
  metaData,
  intl: { formatMessage },
  onCompleted,
  ...props
}: Props): ReactElement | null {
  const user = useAuthUser();
  const [confirmation, setConfirmation] = useState<{ code: string | null }>({
    code: null,
  });
  const [apiErrors, setApiErrors] = useState<CLErrors>({});
  const [processing, setProcessing] = useState<boolean>(false);

  useEffect(() => {
    props.onData({
      key: 'confirmation',
      configuration: {
        position: 2.1,
        stepName: formatMessage(messages.confirmYourAccount),
        onSkipped: () => trackEventByName(tracks.signUpConfirmationStepSkipped),
        onError: () => trackEventByName(tracks.signUpConfirmationStepFailed),
        onCompleted: () =>
          trackEventByName(tracks.signUpConfirmationStepCompleted),
        isEnabled: (metaData) => !!metaData?.requiresConfirmation,
        isActive: (authUser) => !authUser?.attributes?.email_confirmed_at,
      },
    });
  }, []);

  if (props.step !== 'confirmation' || isNilOrError(user)) {
    return null;
  }

  function handleCodeChange(code: string) {
    setApiErrors({});
    setConfirmation((prevConfirmation) => ({
      ...prevConfirmation,
      code,
    }));
  }

  function handleSubmitConfirmation() {
    setProcessing(true);

    confirm(confirmation)
      .then(() => {
        setApiErrors({});
        modifyMetaData(metaData, { requiresConfirmation: false });
        setProcessing(false);
        onCompleted();
      })
      .catch((errors) => {
        setApiErrors(errors);
        setProcessing(false);
      });
  }

  function handleResendCode(e) {
    e.preventDefault();
    setProcessing(true);
    resendCode();
    setProcessing(false);
  }

  function handleGoBack(e) {
    e.preventDefault();
  }

  return (
    <FormContainer id="e2e-confirmation-form" inModal={true}>
      <Form inModal={true} onSubmit={handleSubmitConfirmation}>
        <FormField>
          <StyledLabel>
            <LabelTextContainer>
              <FormattedMessage
                {...messages.anExampleCodeHasBeenSent}
                values={{ userEmail: user.attributes.email }}
              />
            </LabelTextContainer>
          </StyledLabel>
          <StyledCodeInput
            fields={4}
            values={confirmation.code?.split('')}
            onChange={handleCodeChange}
            error={apiErrors.code?.length > 0}
          />
          {apiErrors.code && (
            <Error
              apiErrors={apiErrors.code as CLError[]}
              fieldName="confirmation_code"
            />
          )}
        </FormField>

        <Footer>
          <SubmitButton
            id="e2e-confirmation-button"
            onClick={handleSubmitConfirmation}
            processing={processing}
          >
            <FormattedMessage {...messages.verifyAndContinue} />
          </SubmitButton>
        </Footer>
        <FooterNotes>
          <FooterNote>
            <FormattedMessage {...messages.didntGetAnEmail} />
            <FooterNoteLink onClick={handleResendCode} to="#">
              <FormattedMessage {...messages.sendNewCode} />
            </FooterNoteLink>
          </FooterNote>
          {/* <FooterNote>
            <FormattedMessage {...messages.wrongEmail} />
            <FooterNoteLink onClick={handleGoBack} to="#">
              <FormattedMessage {...messages.goBackToThePreviousStep} />
            </FooterNoteLink>
          </FooterNote> */}
        </FooterNotes>
      </Form>
    </FormContainer>
  );
}

export default injectIntl(ConfirmationSignupStep);

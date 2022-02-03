import React from 'react';
import { useState } from 'react';
import IdeaCTAButton from './IdeaCTAButton';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onClick?: () => {};
  ariaExpanded?: boolean;
}

const IdeaFollowButtonComponent = ({
  intl: { formatMessage },
  // onClick,
  ariaExpanded,
}: Props & InjectedIntlProps) => {
  const [buttonState, setButtonState] = useState(true);
  const toggleState = () => {
    setButtonState(!buttonState);
  };
  return (
    <IdeaCTAButton
      iconName="eye"
      buttonText={formatMessage(
        buttonState == true ? messages.follow : messages.unfollow
      )}
      onClick={toggleState}
      ariaExpanded={ariaExpanded}
    />
  );
};

export default injectIntl(IdeaFollowButtonComponent);

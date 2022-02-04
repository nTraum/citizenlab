import React, { useState } from 'react';
import IdeaCTAButton from './IdeaCTAButton';
import IdeaCTAButtonToggled from './IdeaCTAButtonToggled';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

interface Props {
  onClick?: () => void;
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
  if (buttonState) {
    return (
      <IdeaCTAButton
        iconName="eye"
        buttonText={formatMessage(messages.follow)}
        onClick={toggleState}
        ariaExpanded={ariaExpanded}
      />
    );
  } else {
    return (
      <IdeaCTAButtonToggled
        iconName="eye"
        buttonText={formatMessage(messages.unfollow)}
        onClick={toggleState}
        ariaExpanded={ariaExpanded}
      />
    );
  }
};

export default injectIntl(IdeaFollowButtonComponent);

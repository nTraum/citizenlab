import React from 'react';
import IdeaCTAButton from './IdeaCTAButton';

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
  onClick,
  ariaExpanded,
}: Props & InjectedIntlProps) => {
  return (
    <IdeaCTAButton
      iconName="eye"
      buttonText={formatMessage(messages.follow)}
      onClick={onClick}
      ariaExpanded={ariaExpanded}
    />
  );
};

export default injectIntl(IdeaFollowButtonComponent);

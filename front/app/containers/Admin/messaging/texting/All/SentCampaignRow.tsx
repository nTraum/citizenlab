import React from 'react';
import { TextCell } from 'components/admin/ResourceList';
import { ITextingCampaignData } from 'services/textingCampaigns';
import T from 'components/T';
import { FormattedTime, FormattedDate } from 'react-intl';
import styled from 'styled-components';
import { StatusLabel } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { colors } from 'utils/styleUtils';

interface Props {
  campaign: ITextingCampaignData;
}

const Container = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Left = styled.div`
  display: flex;
  width: 100%;
`;

const TextCellWrapper = styled.div`
  width: 80%;
  overflow-wrap: break-word;
`;

const Right = styled.div`
  display: flex;
  gap: 30px;
`;

// 140px is sufficient for longest date-time string
const DateTime = styled.div`
  width: 140px;
`;

// 174px is sufficient for 999,999 recipients
const StatusWrapper = styled.div`
  width: 174px;
  text-align: right;
`;

const SentCampaignRow = ({ campaign }: Props) => (
  <Container id={campaign.id}>
    <Left>
      <TextCellWrapper>
        <TextCell className="expand">
          <T value={campaign.attributes.body_multiloc} />
        </TextCell>
      </TextCellWrapper>
      <StatusLabel
        backgroundColor={colors.clGreenSuccess}
        text={<FormattedMessage {...messages.sent} />}
      />
    </Left>
    <Right>
      <DateTime>
        <FormattedDate value={campaign.attributes.sent_at} />
        &nbsp;
        <FormattedTime value={campaign.attributes.sent_at} />
      </DateTime>
      <StatusWrapper>
        <p>
          Sent to{' '}
          {campaign.attributes.phone_numbers.length.toLocaleString('en-US')}{' '}
          recipients
        </p>
      </StatusWrapper>
    </Right>
  </Container>
);

export default SentCampaignRow;

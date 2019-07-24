import React, { PureComponent } from 'react';
import styled from 'styled-components';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import T from 'components/T';

const Container = styled.div``;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: ITenantSettings['initiatives'];
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ProposedVoteControl extends PureComponent<Props, State> {
  render() {
    const { initiativeStatus } = this.props;

    return (
      <Container>
        <T value={initiativeStatus.attributes.title_multiloc} />
      </Container>
    );
  }
}

export default ProposedVoteControl;

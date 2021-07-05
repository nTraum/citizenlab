import React from 'react';

// components
import EventsPageMeta from './EventsPageMeta';
import SectionContainer from 'components/SectionContainer';
import ContentContainer from 'components/ContentContainer';
import UpcomingEvents from './UpcomingEvents';
import PastEvents from './PastEvents';

// styling
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  max-width: calc(${(props) => props.theme.maxPageWidth}px - 100px);
  margin-left: auto;
  margin-right: auto;
`;

export default () => {
  const upcomingEvents = Array(15)
    .fill(0)
    .map((_, i) => i + 1);

  const pastEvents = [];

  return (
    <>
      <EventsPageMeta />

      <SectionContainer>
        <StyledContentContainer>
          <UpcomingEvents upcomingEvents={upcomingEvents} />
          <PastEvents pastEvents={pastEvents} />
        </StyledContentContainer>
      </SectionContainer>
    </>
  );
};

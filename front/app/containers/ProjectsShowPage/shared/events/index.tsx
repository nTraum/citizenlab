import React, { memo, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetIdeas from 'resources/GetIdeas';

// hooks
import useProject from 'hooks/useProject';
import useEvents from 'hooks/useEvents';
import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';
import usePhases from 'hooks/usePhases';

// components
import EventCard from 'components/EventCard';
import ContentContainer from 'components/ContentContainer';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// services
import { IPhaseData } from 'services/phases';

// style
import styled from 'styled-components';

// other
import { selectedPhase$ } from '../../timeline/events';
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';
import { scrollToElement } from 'utils/scroll';

const Container = styled.div`
  background: #fff;
`;

const StyledEventCard = styled(EventCard)`
  margin-bottom: 30px;
`;

interface InputProps {
  projectId: string;
  className?: string;
  scrollToEventId?: string;
}

interface DataProps {
  ideasLoaded: boolean;
}

interface Props extends InputProps, DataProps {}

const allHaveLoaded = (...args) => args.every((arg) => !isNilOrError(arg));

const EventsContainer = memo<Props>(
  ({
    projectId,
    className,
    ideasLoaded,
    scrollToEventId: _scrollToEventId,
  }) => {
    const { events } = useEvents({
      projectIds: [projectId],
      sort: 'newest',
    });

    const locale = useLocale();
    const tenant = useAppConfiguration();
    const phases = usePhases(projectId);
    const [scrollToEventId, setScrollToEventId] = useState<null | string>(null);

    useEffect(() => {
      if (!_scrollToEventId) return;
      setScrollToEventId(_scrollToEventId);
    }, []);

    useEffect(() => {
      if (
        scrollToEventId === null ||
        !ideasLoaded ||
        !allHaveLoaded(events, locale, tenant, phases)
      ) {
        return;
      }

      setTimeout(() => {
        scrollToElement({ id: scrollToEventId });
      }, 100);

      setScrollToEventId(null);
    }, [events, locale, tenant, phases, ideasLoaded]);

    if (!isNilOrError(events) && events.length > 0) {
      return (
        <Container id="project-events" className={className || ''}>
          <ContentContainer maxWidth={maxPageWidth}>
            <SectionContainer>
              <ProjectPageSectionTitle>
                <FormattedMessage {...messages.events} />
              </ProjectPageSectionTitle>
              {events.map((event) => (
                <StyledEventCard
                  id={event.id}
                  key={event.id}
                  event={event}
                  showLocation
                  showDescription
                  showAttachments
                />
              ))}
            </SectionContainer>
          </ContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default (props: InputProps) => {
  const { projectId } = props;
  const project = useProject({ projectId });
  const [selectedPhase, setSelectedPhase] = useState<IPhaseData | null>(null);

  useEffect(() => {
    const subscription = selectedPhase$.subscribe((selectedPhase) => {
      setSelectedPhase(selectedPhase);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isNilOrError(project)) return null;

  const sort =
    project.attributes.process_type === 'continuous'
      ? project.attributes.ideas_order
      : selectedPhase?.attributes.ideas_order;

  return (
    <GetIdeas
      type="load-more"
      projectIds={[projectId]}
      pageSize={24}
      sort={sort ?? ideaDefaultSortMethodFallback}
      phaseId={selectedPhase?.id}
    >
      {(dataProps) => {
        const ideasLoaded = !!dataProps.list;
        return <EventsContainer {...props} ideasLoaded={ideasLoaded} />;
      }}
    </GetIdeas>
  );
};

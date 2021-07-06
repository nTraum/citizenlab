import React, { memo, useRef, useState, useEffect } from 'react';
import { isEmpty, every } from 'lodash-es';
import moment from 'moment';

// components
import QuillEditedContent from 'components/UI/QuillEditedContent';
import { Icon } from 'cl2-component-library';
import FileAttachments from 'components/UI/FileAttachments';

// hooks
import useResourceFiles from 'hooks/useResourceFiles';
import useProject from 'hooks/useProject';

// services
import { IEventData } from 'services/events';

// i18n
import T from 'components/T';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// styling
import styled, { useTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

// other
import checkTextOverflow from './checkTextOverflow';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

const EventInformationContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 23px;
  margin-top: 4px;
`;

const EventTitleAndAttributes = styled.div`
  margin-bottom: 18px;
`;

const ProjectTitle = styled.div`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
  margin: 0 0 5px 0;
`;

const ProjectTitleLink = styled(T)`
  text-decoration: underline;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
  }
`;

const EventTitle = styled.h3`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xl}px;
  font-weight: 700;
  line-height: normal;
  margin: 0 0 13px 0;
`;

const EventTimeAndLocationContainer = styled.div`
  display: flex;
  flex-direction: row;

  ${media.smallerThanMinTablet`
    flex-direction: column;
  `}
`;

const TimeOrLocation = styled.div<{ first?: boolean }>`
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.xs}px;
  margin-left: ${({ first }) => (first ? 0 : 23)}px;

  ${media.smallerThanMinTablet`
    margin-left: 0px;
    margin-bottom: ${({ first }) => (first ? 5 : 0)}px;
  `}
`;

interface StyledIconProps {
  width: number;
  height: number;
}

const StyledIcon = styled(Icon)<StyledIconProps>`
  flex: 0 0 24px;
  fill: ${colors.label};
  margin-right: 6px;
  width: ${({ width }) => width}px;
  height: ${({ height }) => height}px;
`;

const EventDescription = styled.div``;

const SMALL_LINE_HEIGHT = fontSizes.small + 2.45;

interface IStyledT {
  hideTextOverflow?: boolean;
}

// https://css-tricks.com/line-clampin/#the-fade-out-way
const StyledT = styled(T)<IStyledT>`
  ${({ hideTextOverflow }) => {
    if (!hideTextOverflow) return '';

    return `
      overflow: hidden;
      height: calc(${SMALL_LINE_HEIGHT}px * 4);

      &:after {
        content: "";
        text-align: right;
        position: absolute;
        bottom: 0;
        right: 0;
        width: 100%;
        height: ${SMALL_LINE_HEIGHT * 2}px;
        background: linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 100%);
      }
    `;
  }}

  p {
    font-size: ${fontSizes.small}px;
    line-height: ${SMALL_LINE_HEIGHT}px;
  }

  color: ${(props: any) => props.theme.colorText};
  position: relative;
  display: block;
`;

const ShowMoreOrLessButton = styled.button`
  margin-top: 18px;
  color: ${colors.label};
  cursor: pointer;
  font-weight: 600;
  text-decoration-line: underline;

  &:hover {
    color: ${({ theme }) => theme.colorMain};
    text-decoration-line: underline;
  }
`;

interface Props {
  event: IEventData;
  startAtMoment: moment.Moment;
  endAtMoment: moment.Moment;
  isMultiDayEvent: boolean;
  showProjectTitle?: boolean;
}

const EventInformation = memo<Props & InjectedIntlProps>((props) => {
  const {
    event,
    isMultiDayEvent,
    startAtMoment,
    endAtMoment,
    showProjectTitle,
    intl,
  } = props;

  const theme: any = useTheme();

  const eventFiles = useResourceFiles({
    resourceType: 'event',
    resourceId: event.id,
  });

  const hasLocation = !every(event.attributes.location_multiloc, isEmpty);
  const eventDateTime = isMultiDayEvent
    ? `${startAtMoment.format('LLL')} - ${endAtMoment.format('LLL')}`
    : `${startAtMoment.format('LL')} • ${startAtMoment.format(
        'LT'
      )} - ${endAtMoment.format('LT')}`;

  const projectId = event.relationships.project.data.id;
  const project = useProject({ projectId });
  const projectTitle = project?.attributes.title_multiloc;
  const projectSlug = project?.attributes.slug;

  const TElement = useRef(null);

  const [textOverflow, setTextOverflow] = useState(true);
  const [hideTextOverflow, setHideTextOverflow] = useState(true);

  const toggleHiddenText = () => setHideTextOverflow(!hideTextOverflow);

  useEffect(() => {
    if (textOverflow === false) return;

    setTextOverflow(true);

    setTimeout(() => {
      setTextOverflow(!!checkTextOverflow(TElement));
    }, 0);
  }, [TElement]);

  const goToProjectPage = () => {
    if (!projectSlug) return;
    clHistory.push(`/projects/${projectSlug}`);
  };

  return (
    <EventInformationContainer data-testid="EventInformation">
      <EventTitleAndAttributes>
        {showProjectTitle && projectTitle && (
          <ProjectTitle>
            <ProjectTitleLink value={projectTitle} onClick={goToProjectPage} />
          </ProjectTitle>
        )}

        <EventTitle>
          <T value={event.attributes.title_multiloc} />
        </EventTitle>

        <EventTimeAndLocationContainer>
          <TimeOrLocation first={true}>
            <StyledIcon
              name="clock-solid"
              width={fontSizes.medium}
              height={fontSizes.medium}
            />
            {eventDateTime}
          </TimeOrLocation>

          {hasLocation && (
            <TimeOrLocation>
              <StyledIcon
                name="mapmarker"
                width={fontSizes.medium}
                height={fontSizes.medium}
              />
              <T value={event.attributes.location_multiloc} />
            </TimeOrLocation>
          )}
        </EventTimeAndLocationContainer>
      </EventTitleAndAttributes>

      <EventDescription>
        <QuillEditedContent textColor={theme.colorText}>
          <StyledT
            value={event.attributes.description_multiloc}
            supportHtml={true}
            ref={TElement}
            wrapInDiv={true}
            hideTextOverflow={hideTextOverflow && textOverflow}
          />
        </QuillEditedContent>

        {((textOverflow && hideTextOverflow) || !hideTextOverflow) && (
          <ShowMoreOrLessButton onClick={toggleHiddenText}>
            {intl.formatMessage(
              hideTextOverflow ? messages.showMore : messages.showLess
            )}
          </ShowMoreOrLessButton>
        )}
      </EventDescription>

      {!isNilOrError(eventFiles) && eventFiles.length > 0 && (
        <FileAttachments files={eventFiles} />
      )}
    </EventInformationContainer>
  );
});

export default injectIntl(EventInformation);

import React, {
  memo,
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { popup, LatLng } from 'leaflet';
// import CSSTransition from 'react-transition-group/CSSTransition';

// components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaButton from 'components/IdeaButton';
import DesktopIdeaMapOverlay from './desktop/IdeaMapOverlay';
import IdeaMapCard from './IdeaMapCard';

// hooks
import useProject from 'hooks/useProject';
import usePhase from 'hooks/usePhase';
import useIdeaMarkers from 'hooks/useIdeaMarkers';
import useWindowSize from 'hooks/useWindowSize';

// services
import { ideaDefaultSortMethodFallback } from 'services/participationContexts';

// events
import {
  setIdeaMapCardSelected,
  setIdeasSearch,
  setIdeasSort,
  setIdeasTopics,
  ideaMapCardSelected$,
  ideasSearch$,
  ideasTopics$,
} from './events';
import {
  setLeafletMapSelectedMarker,
  setLeafletMapHoveredMarker,
  leafletMapSelectedMarker$,
  leafletMapClicked$,
} from 'components/UI/LeafletMap/events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import { media, viewportWidths } from 'utils/styleUtils';

// typings
import { Map as LeafletMap } from 'leaflet';
import { Sort } from 'resources/GetIdeas';
import { IIdeaMarkerData } from 'services/ideas';

const mapMarginDesktop = 70;
const mapHeightDesktop = '85vh';
const mapHeightMobile = '78vh';

const Container = styled.div``;

const InnerContainer = styled.div<{ leftMargin: number | null }>`
  width: ${({ leftMargin }) =>
    leftMargin ? `calc(100vw - ${mapMarginDesktop * 2}px)` : '100%'};
  margin-left: ${({ leftMargin }) =>
    leftMargin ? `-${leftMargin}px` : 'auto'};
  position: relative;

  @media screen and (min-width: 2000px) {
    width: 1800px;
    margin-left: -${(1800 - maxPageWidth) / 2}px;
  }

  > .create-idea-wrapper {
    display: none;
  }

  .activeArea {
    position: absolute;
    top: 0px;
    bottom: 0px;
    right: 0px;
    left: 500px;
  }

  & .pbAssignBudgetControlContainer {
    border: solid 1px #ccc;
    box-shadow: none;
  }

  ${media.smallerThanMaxTablet`
    .activeArea {
      left: 0px;
    }
  `}
`;

// const StyledMap = styled(Map)`
//   border: none;
//   background: transparent;
//   box-shadow: 0px 0px 25px 0px rgba(0, 0, 0, 0.15);
// `;

const IdeaButtonWrapper = styled.div``;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const StyledDesktopIdeaMapOverlay = styled(DesktopIdeaMapOverlay)`
  width: 400px;
  height: calc(${mapHeightDesktop} - 45px);
  position: absolute;
  display: flex;
  top: 20px;
  left: 20px;
  z-index: 900;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)<{ isClickable: boolean }>`
  width: calc(100% - 20px);
  position: absolute;
  top: calc(${mapHeightMobile} - 130px - 20px);
  left: 10px;
  right: 10px;
  z-index: 1000;
  pointer-events: ${(props) => (props.isClickable ? 'auto' : 'none')};
`;

interface Props {
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

const getInnerContainerLeftMargin = (
  windowWidth: number,
  containerWidth: number
) => {
  const leftMargin =
    Math.round((windowWidth - containerWidth) / 2) - mapMarginDesktop;
  return leftMargin > 0 ? leftMargin : null;
};

const initialWindowWidth = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
const initialContainerWidth =
  document?.getElementById('e2e-ideas-container')?.offsetWidth ||
  (initialWindowWidth < maxPageWidth ? initialWindowWidth - 40 : maxPageWidth);
const initialInnerContainerLeftMargin = getInnerContainerLeftMargin(
  initialWindowWidth,
  initialContainerWidth
);

const IdeasMap = memo<Props>(({ projectIds, phaseId, className }) => {
  const project = useProject({ projectId: projectIds?.[0] });
  const phase = usePhase(phaseId || null);
  const { windowWidth } = useWindowSize();
  const smallerThanMaxTablet = windowWidth <= viewportWidths.largeTablet;

  const isPBProject =
    !isNilOrError(project) &&
    project.attributes.participation_method === 'budgeting';

  // refs
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ideaButtonWrapperRef = useRef<HTMLDivElement | null>(null);
  const ideaButtonRef = useRef<HTMLButtonElement | null>(null);

  // state
  const [map, setMap] = useState<LeafletMap | null>(null);
  const [selectedLatLng, setSelectedLatLng] = useState<LatLng | null>(null);
  const [selectedIdeaMarkerId, setSelectedIdeaMarkerId] = useState<
    string | null
  >(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [containerWidth, setContainerWidth] = useState(initialContainerWidth);
  const [innerContainerLeftMargin, setInnerContainerLeftMargin] = useState(
    initialInnerContainerLeftMargin
  );
  const [isCardClickable, setIsCardClickable] = useState(false);

  // ideaMarkers
  const defaultIdeasSearch: string | null = null;
  const defaultIdeasSort: Sort =
    project?.attributes.ideas_order || ideaDefaultSortMethodFallback;
  const defaultIdeasTopics: string[] = [];
  const [search, setSearch] = useState<string | null>(defaultIdeasSearch);
  const [topics, setTopics] = useState<string[]>(defaultIdeasTopics);
  const ideaMarkers = useIdeaMarkers({
    projectIds,
    phaseId,
    search,
    topics,
  });

  useLayoutEffect(() => {
    const containerWidth = containerRef.current
      ?.getBoundingClientRect()
      .toJSON()?.width;

    if (containerWidth) {
      setContainerWidth(containerWidth);
    }
  });

  useEffect(() => {
    const subscriptions = [
      ideaMapCardSelected$.subscribe((ideaId) => {
        setLeafletMapSelectedMarker(ideaId);
        setSelectedIdeaMarkerId(ideaId);
      }),
      leafletMapSelectedMarker$.subscribe((ideaId) => {
        setIdeaMapCardSelected(ideaId);
        setSelectedIdeaMarkerId((_prevIdeaIdideaId) => {
          // temporarily disable pointer events on the mobile ideacard popup to avoid
          // the marker click event from propagating to the card
          setIsCardClickable(false);
          setTimeout(() => {
            setIsCardClickable(true);
          }, 200);
          return ideaId;
        });
      }),
      leafletMapClicked$.subscribe((latLng) => {
        setSelectedLatLng(latLng);
      }),
      ideasSearch$.subscribe((search) => {
        setSearch(search);
      }),
      ideasTopics$.subscribe((topics) => {
        setTopics(topics);
      }),
    ];

    // defaults
    setIdeasSearch(defaultIdeasSearch);
    setIdeasSort(defaultIdeasSort);
    setIdeasTopics(defaultIdeasTopics);

    return () => {
      subscriptions.forEach((subscription) => subscription.unsubscribe());
    };
  }, [project, phase]);

  useEffect(() => {
    if (
      map &&
      selectedLatLng &&
      ideaButtonWrapperRef?.current &&
      ideaButtonRef?.current
    ) {
      popup()
        .setLatLng(selectedLatLng)
        .setContent(ideaButtonWrapperRef.current)
        .openOn(map);
    }
  }, [map, selectedLatLng]);

  useEffect(() => {
    setInnerContainerLeftMargin(
      getInnerContainerLeftMargin(windowWidth, containerWidth)
    );
  }, [windowWidth, containerWidth, smallerThanMaxTablet]);

  useEffect(() => {
    const ideaPoints: Point[] = [];

    if (!isNilOrError(ideaMarkers) && ideaMarkers.length > 0) {
      ideaMarkers.forEach((ideaMarker) => {
        if (
          ideaMarker.attributes &&
          ideaMarker.attributes.location_point_geojson
        ) {
          ideaPoints.push({
            ...ideaMarker.attributes.location_point_geojson,
            id: ideaMarker.id,
          });
        }
      });
    }

    setPoints(ideaPoints);
  }, [ideaMarkers]);

  const handleMapOnInit = (map: LeafletMap) => {
    setMap(map);
  };

  const handleIdeaMapCardOnClose = () => {
    setIdeaMapCardSelected(null);
    setLeafletMapSelectedMarker(null);
    setLeafletMapHoveredMarker(null);
  };

  const selectedIdeaMarker = useMemo(() => {
    return ideaMarkers?.find(({ id }) => id === selectedIdeaMarkerId);
  }, [ideaMarkers, selectedIdeaMarkerId]);

  const setIdeaButtonRef = (element: HTMLButtonElement) => {
    ideaButtonRef.current = element;
  };

  if (!isNilOrError(project)) {
    return (
      <Container ref={containerRef} className={className || ''}>
        <InnerContainer leftMargin={innerContainerLeftMargin}>
          {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 && (
            <StyledWarning
              text={<FormattedMessage {...messages.nothingOnMapWarning} />}
            />
          )}

          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_mapTitle} />
          </ScreenReaderOnly>

          {smallerThanMaxTablet && selectedIdeaMarker && (
            <StyledIdeaMapCard
              ideaMarker={selectedIdeaMarker as IIdeaMarkerData}
              isPBProject={!!isPBProject}
              onClose={handleIdeaMapCardOnClose}
              isClickable={isCardClickable}
            />
          )}

          <Map
            onInit={handleMapOnInit}
            projectId={project.id}
            points={points}
            mapHeight={
              smallerThanMaxTablet ? mapHeightMobile : mapHeightDesktop
            }
            noMarkerClustering={false}
            zoomControlPosition={smallerThanMaxTablet ? 'topleft' : 'topright'}
            layersControlPosition="topright"
          />

          {!smallerThanMaxTablet && projectIds && !isNilOrError(project) && (
            <StyledDesktopIdeaMapOverlay
              projectIds={projectIds}
              projectId={project?.id}
              phaseId={phaseId}
            />
          )}

          {/* {smallerThanMaxTablet && selectedIdeaMarker && (
            <MobileIdeaMapCard
              className="animation"
              isClickable={isCardClickable}
            >
              <IdeaMapCard
                ideaMarker={selectedIdeaMarker as IIdeaMarkerData}
                isPBProject={!!isPBProject}
                onClose={handleIdeaMapCardOnClose}
              />
            </MobileIdeaMapCard>
          )} */}

          <IdeaButtonWrapper
            className="create-idea-wrapper"
            ref={ideaButtonWrapperRef}
          >
            <IdeaButton
              projectId={project.id}
              phaseId={phaseId || undefined}
              participationContextType={phaseId ? 'phase' : 'project'}
              latLng={selectedLatLng}
              inMap={true}
              setSubmitButtonRef={setIdeaButtonRef}
            />
          </IdeaButtonWrapper>
        </InnerContainer>
      </Container>
    );
  }

  return null;
});

export default IdeasMap;

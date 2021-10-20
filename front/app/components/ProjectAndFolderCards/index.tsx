import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual, isEmpty, isString } from 'lodash-es';
import { withRouter, WithRouterProps } from 'react-router';
import { stringify } from 'qs';

// components
import Header from './components/Header';
import EmptyContainer from './components/EmptyContainer';
import ProjectsList from './components/ProjectsList';
import LoadingBox from './components/LoadingBox';
import Footer from './components/Footer';

// resources
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAdminPublications, {
  GetAdminPublicationsChildProps,
} from 'resources/GetAdminPublications';

// services
import { InputProps as UseAdminPublicationInputProps } from 'hooks/useAdminPublications';

// routing
import { removeLocale } from 'utils/cl-router/updateLocationDescriptor';
import clHistory from 'utils/cl-router/history';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

export type TLayout = 'dynamic' | 'threecolumns' | 'twocolumns';

interface InputProps extends UseAdminPublicationInputProps {
  showTitle: boolean;
  layout: TLayout;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  adminPublications: GetAdminPublicationsChildProps;
}

interface Props extends InputProps, DataProps {}

export type TCardSize = 'small' | 'medium' | 'large';

interface State {
  cardSizes: TCardSize[];
  areas: string[];
}

class ProjectAndFolderCards extends PureComponent<
  Props & InjectedIntlProps & WithRouterProps,
  State
> {
  emptyArray: string[] = [];

  constructor(props) {
    super(props);
    this.state = {
      cardSizes: [],
      areas: [],
    };
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    const areas = this.getAreasFromQueryParams();

    if (!isEqual(this.state.areas, areas)) {
      this.setState({ areas });
    }

    const { adminPublications } = this.props;
    if (
      !isEqual(prevState.areas, this.state.areas) &&
      !isNilOrError(adminPublications)
    ) {
      adminPublications.onChangeAreas(this.state.areas);
    }
  }

  getAreasFromQueryParams = () => {
    let areas: string[] = [];
    const { query } = this.props.location;

    if (query.areas && !isEmpty(query.areas)) {
      areas = isString(query.areas) ? [query.areas] : query.areas;
    }

    return areas;
  };

  showMore = () => {
    trackEventByName(tracks.clickOnProjectsShowMoreButton);
    this.props.adminPublications.onLoadMore();
  };

  handleAreasOnChange = (areas: string[]) => {
    if (!isEqual(this.state.areas, areas)) {
      trackEventByName(tracks.clickOnProjectsAreaFilter);
      const { pathname } = removeLocale(this.props.location.pathname);
      const query = { ...this.props.location.query, areas };
      const search = `?${stringify(query, { indices: false, encode: false })}`;
      clHistory.replace({ pathname, search });
    }
  };

  render() {
    const { areas } = this.state;
    const {
      tenant,
      showTitle,
      layout,
      adminPublications,
      publicationStatusFilter,
    } = this.props;
    const { loadingInitial, loadingMore, hasMore, list } = adminPublications;
    const hasPublications = list && list.length > 0;

    if (!isNilOrError(tenant)) {
      const customCurrentlyWorkingOn =
        tenant.attributes.settings.core.currently_working_on_text;

      return (
        <Container id="e2e-projects-container">
          <Header
            showTitle={showTitle}
            customCurrentlyWorkingOn={customCurrentlyWorkingOn}
            areas={areas}
            onAreasChange={this.handleAreasOnChange}
          />

          {loadingInitial && <LoadingBox />}

          {!loadingInitial && !hasPublications && <EmptyContainer />}

          {!loadingInitial && hasPublications && list && (
            <ProjectsList
              list={list}
              layout={layout}
              publicationStatusFilter={publicationStatusFilter}
              hasMore={hasMore}
            />
          )}

          {!loadingInitial && hasPublications && hasMore && (
            <Footer loadingMore={loadingMore} onShowMore={this.showMore} />
          )}
        </Container>
      );
    }

    return null;
  }
}

const ProjectAndFolderCardsWithHOCs = injectIntl<Props>(
  withRouter(ProjectAndFolderCards)
);

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  adminPublications: ({ render, ...props }) => (
    <GetAdminPublications
      pageSize={6}
      prefetchProjects
      rootLevelOnly
      removeNotAllowedParents
      {...props}
    >
      {render}
    </GetAdminPublications>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <ProjectAndFolderCardsWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);

// Libs
import * as React from 'react';
import { find } from 'lodash';

// Components
import Map from 'components/Map';
import IdeaBox from './IdeaBox';

// Styling
import styled from 'styled-components';

const MapWrapper = styled.div`
  display: flex;
  margin-bottom: 2rem;

  > div {
    flex: 1;
  }
`;

// Typing
import { IIdeaData } from 'services/ideas';
interface Props {
  ideas?: IIdeaData[];
}

interface State {
  selectedIdea: IIdeaData | null;
}

export default class IdeasMap extends React.Component<Props, State> {
  private ideaPoints: any[] = [];

  constructor(props) {
    super(props);

    this.updatePoints(props.ideas);
    this.state = {
      selectedIdea: null,
    };
  }

  componentWillReceiveProps(props) {
    this.updatePoints(props.ideas);
  }

  updatePoints = (ideas: IIdeaData[]) => {
    if (ideas) {
      this.ideaPoints = [];
      ideas.forEach((idea) => {
        if (idea.attributes.location_point_geojson) this.ideaPoints.push({ ...idea.attributes.location_point_geojson, data: idea.id });
      });
    }
  }

  selectIdea = (id) => {
    this.setState({ selectedIdea: find(this.props.ideas, { id }) as IIdeaData });
  }

  deselectIdea = () => {
    this.setState({ selectedIdea: null });
  }

  render() {
    return (
      <MapWrapper>
        {this.state.selectedIdea &&
          <IdeaBox idea={this.state.selectedIdea} />
        }
        <Map points={this.ideaPoints} onMarkerClick={this.selectIdea} />
      </MapWrapper>
    );
  }
}

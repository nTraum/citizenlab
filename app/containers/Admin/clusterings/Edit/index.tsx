import React, { PureComponent } from 'react';
import { clone } from 'lodash-es';
import Circles from './Circles';
import { Node } from 'services/clusterings';
import InfoPane from './InfoPane';
import styled, { ThemeProvider } from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import GetClustering, { GetClusteringChildProps } from 'resources/GetClustering';
import { withRouter, WithRouterProps } from 'react-router';
import { globalState, IGlobalStateService, IAdminFullWidth } from 'services/globalState';
import { colors, media } from 'utils/styleUtils';
import { injectTracks } from 'utils/analytics';
import tracks from '../tracks';

const TwoColumns = styled.div`
  flex-shrink: 0;
  flex-grow: 1;
  flex-basis: auto;
  width: 100%;
  height: calc(100vh - ${props => props.theme.menuHeight}px - 85px);
  display: flex;
  flex-wrap: nowrap;
  align-items: stretch;
  margin-bottom: 35px;
`;

const StyledCircles = styled(Circles)`
  flex-shrink: 1;
  flex-grow: 1;
  flex-basis: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border: solid 1px ${colors.separation};
  border-radius: 5px;
  padding: 25px;
  /* overflow: hidden; */
`;

const StyledInfoPane = styled(InfoPane)`
  flex:  0 0 350px;
  margin-left: 20px;

  ${media.smallerThan1280px`
    flex:  0 0 300px;
  `}
`;

interface InputProps {}

interface DataProps {
  clustering: GetClusteringChildProps;
}

interface TrackProps {
  trackClickCluster: Function;
  trackCtrlClickCluster: Function;
  trackShiftClickCluster: Function;
  trackClickIdea: Function;
  trackCtrlClickIdea: Function;
  trackShiftClickIdea: Function;
}

interface Props extends InputProps, DataProps {}

interface State {
  activeComparison: number;
  selectedNodes: Node[][];
}

class ClusterViewer extends PureComponent<Props & WithRouterProps & TrackProps, State> {
  globalState: IGlobalStateService<IAdminFullWidth>;

  constructor(props) {
    super(props);
    this.state = {
      activeComparison: 0,
      selectedNodes: [[]],
    };
    this.globalState = globalState.init('AdminFullWidth');
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  comparisonSet = () => {
    return this.state.selectedNodes[this.state.activeComparison];
  }

  theme = (theme) => {
    const comparisonColors = ['#fbbd08', '#a333c8', '#f2711c', '#00b5ad'];

    return {
      ...theme,
      comparisonColors,
      upvotes: theme.colors.clGreen,
      downvotes: theme.colors.clRed,
      chartLabelColor: '#999999',
      chartLabelSize: 13
    };
  }

  handleOnChangeActiveComparison = (activeComparison) => {
    this.setState({ activeComparison });
  }

  handleOnAddComparison = () => {
    this.setState(({ selectedNodes }) => ({
      selectedNodes: [...selectedNodes, []],
      activeComparison: selectedNodes.length
    }));
  }

  handleOnDeleteComparison = (index: number) => {
    const { activeComparison, selectedNodes } = this.state;
    const newSelectedNodes = clone(selectedNodes);
    newSelectedNodes.splice(index, 1);
    const newActiveComparison = activeComparison >= index ? newSelectedNodes.length - 1 : activeComparison;
    this.setState({
      selectedNodes: newSelectedNodes,
      activeComparison: newActiveComparison,
    });
  }

  handleOnClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackClickCluster({ extra: { type: node.type, id: node.id } });
    }
    this.setState({
      selectedNodes: [[node]],
      activeComparison: 0
    });
  }

  handleOnShiftClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackShiftClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackShiftClickCluster({ extra: { type: node.type, id: node.id } });
    }
    const selectedNodes = clone(this.state.selectedNodes);
    selectedNodes[this.state.activeComparison] = [...this.comparisonSet(), node];
    this.setState({ selectedNodes });
  }

  handleOnCtrlClickNode = (node: Node) => {
    if (node.type === 'idea') {
      this.props.trackCtrlClickIdea({ extra: { id: node.id } });
    } else {
      this.props.trackCtrlClickCluster({ extra: { type: node.type, id: node.id } });
    }
    if (this.state.selectedNodes.length < 4) {
      this.setState(({ selectedNodes }) => ({
        selectedNodes: [...selectedNodes, [node]],
        activeComparison: selectedNodes.length
      }));
    }
  }

  render() {
    const { clustering } = this.props;
    const { activeComparison, selectedNodes } = this.state;

    if (isNilOrError(clustering)) return null;

    return (
      <ThemeProvider theme={this.theme}>
        <TwoColumns>
          <StyledCircles
            activeComparison={activeComparison}
            selectedNodes={selectedNodes}
            structure={clustering.attributes.structure}
            onClickNode={this.handleOnClickNode}
            onShiftClickNode={this.handleOnShiftClickNode}
            onCtrlClickNode={this.handleOnCtrlClickNode}
          />
          <StyledInfoPane
            activeComparison={activeComparison}
            selectedNodes={selectedNodes}
            onAddComparison={this.handleOnAddComparison}
            onChangeActiveComparison={this.handleOnChangeActiveComparison}
            onDeleteComparison={this.handleOnDeleteComparison}
          />
        </TwoColumns>
      </ThemeProvider>
    );
  }
}

const ClusterViewerWithHocs = injectTracks<Props>({
  trackClickCluster: tracks.clickCluster,
  trackCtrlClickCluster: tracks.ctrlClickCluster,
  trackShiftClickCluster: tracks.shiftClickCluster,
  trackClickIdea: tracks.clickIdea,
  trackCtrlClickIdea: tracks.ctrlClickIdea,
  trackShiftClickIdea: tracks.shiftClickIdea,
})(ClusterViewer);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetClustering id={inputProps.params.clusteringId}>
    {(clustering) => <ClusterViewerWithHocs {...inputProps} clustering={clustering} />}
  </GetClustering>
));

import React, { PureComponent } from 'react';
import styled from 'styled-components';

import Observer from '@researchgate/react-intersection-observer';

const Container = styled.div``;

const ProgressBarOuter = styled.div<{ bgColor: string }>`
  width: 100%;
  height: 100%;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${props => props.bgColor};
`;

const ProgressBarInner: any = styled.div<{ progress: number, color: string }>`
  width: 0px;
  height: 100%;
  border-radius: ${(props: any) => props.theme.borderRadius};
  background: ${props => props.color};
  transition: width 1000ms cubic-bezier(0.19, 1, 0.22, 1);
  will-change: width;

  &.visible {
    width: ${(props) => props.progress * 100}%;
  }
`;

interface Props {
  /** Number between 0 and 1 */
  progress: number;
  color: string;
  bgColor: string;
  /** Whether the background has a diagonal stripes pattern, defaults to false */
  bgShaded?: boolean;
  className?: string;
}

interface State {
  visible: boolean;
}

class ProgressBar extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  handleIntersection = (event: IntersectionObserverEntry, unobserve: () => void) => {
    if (event.isIntersecting) {
      this.setState({ visible: true });
      unobserve();
    }
  }
  render() {
    const { progress, color, bgColor, className } = this.props;
    const { visible } = this.state;

    return (
      <Container className={className}>
        <Observer onChange={this.handleIntersection}>
          <ProgressBarOuter bgColor={bgColor}>
            <ProgressBarInner progress={progress} className={visible ? 'visible' : ''} color={color} />
          </ProgressBarOuter>
        </Observer>
      </Container>
    );
  }
}

export default ProgressBar;

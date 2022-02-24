import React, { lazy, Suspense } from 'react';
import './builder-settings';

import { BuilderComponent, builder } from '@builder.io/react';
import { useEffect, useState } from 'react';

builder.init('7b78e1a1ad944f6dbe06cd71d7941555');

// Register our heading component for use in
// the visual editor
export const TestCustomComponent = () => {
  <h1 className="my-heading">"HIII"</h1>;
};

// components
import SignedOutHeader from './SignedOutHeader';
import SignedInHeader from './SignedInHeader';
import Fragment from 'components/Fragment';
import LoadingBox from 'components/ProjectAndFolderCards/components/LoadingBox';
const MainContent = lazy(() => import('./MainContent'));
const HomepageInfoSection = lazy(() => import('./HomepageInfoSection'));
const Footer = lazy(() => import('./Footer'));

// hooks
import useAuthUser from 'hooks/useAuthUser';

// utils
import { isNilOrError } from 'utils/helperUtils';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.main`
  height: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  background: #fff;

  ${media.smallerThanMaxTablet`
    min-height: auto;
  `}
`;

const Content = styled.div`
  width: 100%;
  z-index: 3;
`;

let BuilderPage = () => {
  const [pageJson, setPage] = useState(undefined);

  useEffect(() => {
    builder.get('page', { url: '/builder-test' }).promise().then(setPage);
  }, []);

  console.log('RETURN:');
  console.log(pageJson);

  return <BuilderComponent model="builder-test" content={pageJson} />;
};

const LandingPage = () => {
  const authUser = useAuthUser();

  return (
    <>
      <Container id="e2e-landing-page">
        {!isNilOrError(authUser) ? (
          <SignedInHeader />
        ) : (
          <Fragment name="signed-out-header">
            <SignedOutHeader />
          </Fragment>
        )}

        <Content>
          <Suspense fallback={<LoadingBox />}>
            <MainContent />
            <BuilderPage />
            <HomepageInfoSection />
            <Footer />
          </Suspense>
        </Content>
      </Container>
    </>
  );
};

export default LandingPage;

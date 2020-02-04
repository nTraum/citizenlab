import React from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import ImageZoom from 'react-medium-image-zoom';
import Fragment from 'components/Fragment';
import Sharing from 'components/Sharing';

// resources
import GetProjectFolder, { GetProjectFolderChildProps } from 'resources/GetProjectFolder';
import GetProjectImages, { GetProjectImagesChildProps } from 'resources/GetProjectImages';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import T from 'components/T';
import messages from './messages';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// style
import styled, { withTheme } from 'styled-components';
import { media, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import QuillEditedContent from 'components/UI/QuillEditedContent';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 50px;
  margin-bottom: 100px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    justify-content: flex-start;
    margin-top: 20px;
    margin-bottom: 80px;
  `}
`;

const Left = styled.div`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Right = styled.div`
  width: 100%;
  max-width: 340px;
  margin-left: 70px;

  ${media.smallerThanMinTablet`
    flex: 1;
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    margin-top: 20px;
  `}
`;

const ProjectDescription = styled.div``;

const ProjectImages = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  margin-left: -5px;
  margin-top: -5px;
  margin-bottom: 30px;
  width: calc(100% + 10px);

  img {
    margin: 5px;
    border-radius: ${(props: any) => props.theme.borderRadius};
    border: solid 1px ${colors.separation};

    &:first-child {
      width: calc(100% - 10px);
    }

    &:not(:first-child) {
      width: calc(33% - 9px);
    }
  }
`;

interface InputProps {
  projectFolderId: string;
}

interface DataProps {
  projectFolder: GetProjectFolderChildProps;
  projectImages: GetProjectImagesChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {
  theme: any;
}

const ProjectInfo = (props: Props & InjectedIntlProps) => {
  const { projectFolder, projectImages, theme, intl: { formatMessage }, authUser } = props;
  const folderUrl = location.href;
  const utmParams = authUser ? {
    source:'share_project',
    campaign:'share_content',
    content: authUser.id
  } : {
    source:'share_project',
    campaign:'share_content'
  };

  if (!isNilOrError(projectFolder)) {
    return (
      <Container className="e2e-project-info">
        <Fragment name={`folders/${projectFolder.id}/info`}>
          <ScreenReaderOnly>
            <FormattedMessage tagName="h2" {...messages.invisibleTitleMainContent} />
          </ScreenReaderOnly>
          <Left>
            <ProjectDescription>
              <QuillEditedContent textColor={theme.colorText}>
                <T value={projectFolder.attributes.description_multiloc} supportHtml={true}/>
              </QuillEditedContent>
            </ProjectDescription>
          </Left>

          <Right>
            {!isNilOrError(projectImages) && projectImages.length > 0 &&
              <ProjectImages className="e2e-project-images">
                {projectImages.filter(projectImage => projectImage).map((projectImage) => (
                  <ImageZoom
                    key={projectImage.id}
                    image={{
                      src: projectImage.attributes.versions.large,
                      alt: ''
                    }}
                    zoomImage={{
                      src: projectImage.attributes.versions.large,
                      alt: ''
                    }}
                  />
                ))}
              </ProjectImages>
            }
            <T value={projectFolder.attributes.title_multiloc} maxLength={50} >
              {(title) => {
                return (
                  <Sharing
                    context="project"
                    url={folderUrl}
                    titleLevel="h2"
                    twitterMessage={formatMessage(messages.twitterMessage, { title })}
                    utmParams={utmParams}
                  />);
              }}
            </T>
          </Right>
        </Fragment>
      </Container>
    );
  }

  return null;
};

const ProjectInfoWhithHoc = withTheme(injectIntl<Props>(ProjectInfo));

const Data = adopt<DataProps, InputProps>({
  projectFolder: ({ projectFolderId, render }) => <GetProjectFolder projectFolderId={projectFolderId}>{render}</GetProjectFolder>,
  projectImages: ({ projectFolderId, render }) => <GetProjectImages projectFolderId={projectFolderId}>{render}</GetProjectImages>,
  authUser: ({ render }) => <GetAuthUser>{render}</GetAuthUser>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => {
      if (!isNilOrError(dataProps.projectFolder)) {
        return (
          <ProjectInfoWhithHoc
            {...inputProps}
            {...dataProps}
          />
        );
      }

      return null;
    }}
  </Data>
);

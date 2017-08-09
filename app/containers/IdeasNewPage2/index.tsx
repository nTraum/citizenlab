import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import CSSTransition from 'react-transition-group/CSSTransition';
import Transition from 'react-transition-group/Transition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { makeSelectLocale } from 'containers/LanguageProvider/selectors';
import { injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import { injectTFunc } from 'utils/containers/t/utils';
import { stateStream, IStateStream } from 'services/state';
import { EditorState, convertToRaw } from 'draft-js';
import { IStream } from 'utils/streams';
import { IUser } from 'services/users';
import { IIdea, addIdea } from 'services/ideas';
import { addIdeaImage } from 'services/ideaImages';
import { observeCurrentUser, getAuthUser } from 'services/auth';
import draftToHtml from 'draftjs-to-html';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import { ImageFile } from 'react-dropzone';
import Upload, { ExtendedImageFile } from 'components/UI/Upload';
import { media } from 'utils/styleUtils';
import styled from 'styled-components';
import messages from './messages';
import ButtonBar, { namespace as ButtonBarNamespace, State as IButtonBarState } from './ButtonBar';
import NewIdeaForm, { namespace as NewIdeaFormNamespace, State as INewIdeaFormState } from './NewIdeaForm';
import SignInUp from './SignInUp';

const Container = styled.div`
  background: #f2f2f2;
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: calc(100vh - 105px);
  padding-top: 40px;
  position: relative;
  background: #f2f2f2;
  -webkit-backface-visibility: hidden;
  will-change: opacity, transform;

  &.page-enter {
    position: absolute;
    opacity: 0.01;
    transform: translateX(100vw);

    ${media.desktop`
      transform: translateX(800px);
    `}

    &.ideaForm {
      transform: translateX(-100vw);

      ${media.desktop`
        transform: translateX(-800px);
      `}
    }

    &.page-enter-active {
      opacity: 1;
      transform: translateX(0);
      transition: transform 800ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 800ms cubic-bezier(0.19, 1, 0.22, 1);
    }
  }

  &.page-exit {
    opacity: 1;
    transform: translateX(0);

    &.page-exit-active {
      opacity: 0.01;
      transform: translateX(100vw);
      transition: transform 800ms cubic-bezier(0.19, 1, 0.22, 1),
                  opacity 800ms cubic-bezier(0.19, 1, 0.22, 1);

      ${media.desktop`
        transform: translateX(800px);
      `}

      &.ideaForm {
        transform: translateX(-100vw);

        ${media.desktop`
          transform: translateX(-800px);
        `}
      }
    }
  }
`;

const ButtonBarContainer = styled.div`
  width: 100%;
  height: 68px;
  position: fixed;
  z-index: 99999;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  box-shadow: 0 -1px 1px 0 rgba(0, 0, 0, 0.12);
  -webkit-backface-visibility: hidden;
  will-change: auto;

  ${media.phone`
    display: none;
  `}

  &.buttonbar-enter {
    transform: translateY(64px);
    will-change: transform;

    &.buttonbar-enter-active {
      transform: translateY(0);
      transition: transform 800ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }

  &.buttonbar-exit {
    transform: translateY(0);
    will-change: transform;

    &.buttonbar-exit-active {
      transform: translateY(64px);
      transition: transform 800ms cubic-bezier(0.165, 0.84, 0.44, 1);
    }
  }
`;

type Props = {
  intl: ReactIntl.InjectedIntl;
  tFunc: Function;
  locale: string;
};

type State = {
  showIdeaForm: boolean;
};

export const namespace = 'IdeasNewPage2/index';

class IdeasNewPage2 extends React.PureComponent<Props, State> {
  newIdeaFormState$: IStateStream<INewIdeaFormState>;
  buttonBarState$: IStateStream<IButtonBarState>;
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.newIdeaFormState$ = stateStream.observe<INewIdeaFormState>(NewIdeaFormNamespace, {
      topics: null,
      projects: null,
      title: null,
      description: EditorState.createEmpty(),
      selectedTopics: null,
      selectedProject: null,
      location: null,
      images: null,
      titleError: null,
      descriptionError: null,
      submitError: false,
      processing: false
    });
    this.buttonBarState$ = stateStream.observe<IButtonBarState>(ButtonBarNamespace, {
      submitError: false,
      processing: false
    });
    this.state$ = stateStream.observe<State>(namespace, { showIdeaForm: true });
    this.subscriptions = [];
  }

  componentWillMount() {
    this.subscriptions = [
      this.buttonBarState$.observable.subscribe(),
      this.newIdeaFormState$.observable.subscribe(),
      this.state$.observable.subscribe(state => this.setState(state)),
    ];
  }

  componentWillUnmount() {
    this.newIdeaFormState$.observable.first().subscribe(
      (newIdeaFormState) => {
        _(newIdeaFormState.images).forEach(image => image.preview && window.URL.revokeObjectURL(image.preview));
        _(this.subscriptions).forEach(subscription => subscription.unsubscribe());
      }, 
      (error) => console.log(error)
    );
  }

  async convertToGeoJson(location: string) {
    const results = await geocodeByAddress(location);
    const { lat, lng } = await getLatLng(results[0]);
    return {
      type: 'Point',
      coordinates: [lat, lng]
    };
  }

  async getBase64(image: ImageFile) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event: any) => resolve(event.target.result);
      reader.onerror = (error) => reject(new Error(`error for getBase64() of component IdeasNewPage2`));
      reader.readAsDataURL(image);
    });
  }

  async postIdea(newIdeaFormState: INewIdeaFormState, userId: string) {
    const { locale } = this.props;
    const { topics, projects, title, description, selectedTopics, selectedProject, location } = newIdeaFormState;
    const ideaTitle = { [locale]: title as string };
    const ideaDescription = { [locale]: draftToHtml(convertToRaw(description.getCurrentContent())) };
    const topicIds = (selectedTopics ? selectedTopics.map(topic => topic.value) : null);
    const projectId = (selectedProject ? selectedProject.value : null);
    const locationGeoJSON = (_.isString(location) && !_.isEmpty(location) ? await this.convertToGeoJson(location) : null);
    const locationDescription = (_.isString(location) && !_.isEmpty(location) ? location : null);
    return await addIdea(userId, 'published', ideaTitle, ideaDescription, topicIds, projectId, locationGeoJSON, locationDescription);
  }

  async postIdeaImage(ideaId: string, image: ExtendedImageFile) {
    try {
      const base64Image = await this.getBase64(image);
      return await addIdeaImage(ideaId, base64Image, 0);
    } catch (error) {
      return error;
    }
  }

  async postIdeaAndIdeaImage(currentUserId: string) {
    return new Promise<IIdea | null>((resolve, reject) => {
      const onError = () => reject(new Error(`error for postIdeaAndIdeaImage() of component IdeasNewPage2`));

      this.newIdeaFormState$.observable.first().subscribe(
        async (newIdeaFormState) => {
          try {
            const { images } = newIdeaFormState;
            const idea = await this.postIdea(newIdeaFormState, currentUserId);
            images && images.length > 0 && await this.postIdeaImage(idea.data.id, images[0]);
            resolve(idea);
          } catch (error) {
            onError();
          }
        },
        (error) => {
          onError();
        }
      );
    });
  }

  handleOnIdeaSubmit = async () => {
    const { locale, intl } = this.props;

    this.setSubmitErrorTo(false);
    this.setProcessingTo(true);

    try {
      const authUser = await getAuthUser();
      const idea = await this.postIdeaAndIdeaImage(authUser.data.id);
      this.setProcessingTo(false);
      browserHistory.push('ideas');
    } catch (error) {
      this.setProcessingTo(false);

      if (_.isError(error) && error.message === 'not authenticated') {
        window.scrollTo(0, 0);
        this.state$.next({ showIdeaForm: false });
      } else {
        this.setSubmitErrorTo(true);
      }
    }
  }

  setProcessingTo(processing: boolean) {
    this.newIdeaFormState$.next({ processing });
    this.buttonBarState$.next({ processing });
  }

  setSubmitErrorTo(submitError: boolean) {
    this.newIdeaFormState$.next({ submitError });
    this.buttonBarState$.next({ submitError });
  }

  handleOnSingInUpGoBack = () => {
    this.state$.next({ showIdeaForm: true });
  }

  handleOnSignInUpCompleted = () => {
    this.handleOnIdeaSubmit();
  }

  render() {
    const { showIdeaForm } = this.state;
    const { intl, tFunc, locale } = this.props;
    const timeout = 800;

    const buttonBar = showIdeaForm && (
      <CSSTransition classNames="buttonbar" timeout={timeout}>
        <ButtonBarContainer>
          <ButtonBar intl={intl} tFunc={tFunc} locale={locale} onSubmit={this.handleOnIdeaSubmit} />
        </ButtonBarContainer>
      </CSSTransition>
    );

    const newIdeasForm = showIdeaForm && (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer className="ideaForm">
          <NewIdeaForm intl={intl} tFunc={tFunc} locale={locale} onSubmit={this.handleOnIdeaSubmit} />
        </PageContainer>
      </CSSTransition>
    );

    const signInUp = !showIdeaForm && (
      <CSSTransition classNames="page" timeout={timeout}>
        <PageContainer>
          <SignInUp
            intl={intl}
            tFunc={tFunc}
            locale={locale}
            onGoBack={this.handleOnSingInUpGoBack}
            onSignInUpCompleted={this.handleOnSignInUpCompleted}
          />
        </PageContainer>
      </CSSTransition>
    );

    return (
      <Container>
        <TransitionGroup>
          {buttonBar}
          {newIdeasForm}
          {signInUp}
        </TransitionGroup>
      </Container>
    );
  }
}

const mapStateToProps = createStructuredSelector({
  locale: makeSelectLocale(),
});

export default injectTFunc(injectIntl(connect(mapStateToProps, null)(IdeasNewPage2)));

import React, { FormEvent, memo, useState } from 'react';
import { includes, isUndefined } from 'lodash-es';
import {
  isNilOrError,
  isUndefinedOrError,
  capitalizeParticipationContextType,
} from 'utils/helperUtils';

// components
import Button from 'components/UI/Button';

// services
import { IProjectData } from 'services/projects';
import {
  getCurrentPhase,
  getLatestRelevantPhase,
  IPhaseData,
} from 'services/phases';
import { addBasket, updateBasket } from 'services/baskets';

// resources
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { GetAppConfigurationChildProps } from 'resources/GetAppConfiguration';
import { GetLocaleChildProps } from 'resources/GetLocale';
import { GetIdeaChildProps } from 'resources/GetIdea';
import { GetProjectChildProps } from 'resources/GetProject';
import { GetPhasesChildProps } from 'resources/GetPhases';

// hooks
import useAuthUser from 'hooks/useAuthUser';
import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocale from 'hooks/useLocale';
import useIdea from 'hooks/useIdea';
import useBasket from 'hooks/useBasket';
import useProject from 'hooks/useProject';
import usePhases from 'hooks/usePhases';

// tracking
import { trackEventByName } from 'utils/analytics';
import tracks from 'containers/ProjectsShowPage/shared/pb/tracks';

// utils
import streams from 'utils/streams';
import { openSignUpInModal } from 'components/SignUpIn/events';

// i18n
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { FormattedNumber, InjectedIntlProps } from 'react-intl';
import messages from './messages';

// styles
import styled from 'styled-components';
import { fontSizes, colors, defaultCardStyle, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import PBExpenses from 'containers/ProjectsShowPage/shared/pb/PBExpenses';

// typings
import { IParticipationContextType } from 'typings';

const IdeaCardContainer = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;

  ${media.smallerThanMaxTablet`
    padding: 20px;
    background: ${colors.backgroundLightGrey};
  `}
`;

const BudgetWithButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
`;

const Budget = styled.div`
  width: 100%;
  height: 90px;
  color: ${(props: any) => props.theme.colorText};
  font-size: ${fontSizes.medium}px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 3px;
  ${defaultCardStyle};
`;

const StyledPBExpenses = styled(PBExpenses)`
  margin-top: 25px;
  padding: 20px;
`;

interface OuterProps {
  view: 'ideaCard' | 'ideaPage';
  projectId: string;
  ideaId: string;
  className?: string;
}

interface InnerProps extends OuterProps {
  authUser: GetAuthUserChildProps;
  tenant: GetAppConfigurationChildProps;
  locale: GetLocaleChildProps;
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
  phases: GetPhasesChildProps;
  participationContext: IProjectData | IPhaseData;
  participationContextId: string;
  participationContextType: IParticipationContextType;
}

const AssignBudgetControl = memo<InnerProps & InjectedIntlProps>(
  ({
    view,
    ideaId,
    authUser,
    tenant,
    locale,
    idea,
    phases,
    participationContext,
    participationContextId,
    participationContextType,
    intl,
    className,
  }) => {
    const basket = useBasket(
      participationContext?.relationships?.user_basket?.data?.id
    );

    const [processing, setProcessing] = useState(false);

    const handleAddRemoveButtonClick = (event?: FormEvent) => {
      event?.preventDefault();
      event?.stopPropagation();
      assignBudget();
    };

    const assignBudget = async () => {
      const timeout = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const done = async () => {
        await timeout(200);
        setProcessing(false);
      };

      if (!isNilOrError(idea)) {
        const isBudgetingEnabled =
          idea.attributes.action_descriptor.budgeting?.enabled;
        const basketIdeaIds = !isNilOrError(basket)
          ? basket.relationships.ideas.data.map((idea) => idea.id)
          : [];
        const isInBasket = includes(basketIdeaIds, ideaId);
        const budgetingDisabledReason =
          idea.attributes.action_descriptor.budgeting?.disabled_reason;

        if (
          isNilOrError(authUser) ||
          budgetingDisabledReason === 'not_verified'
        ) {
          openSignUpInModal({
            verification: budgetingDisabledReason === 'not_verified',
            verificationContext:
              budgetingDisabledReason === 'not_verified'
                ? {
                    action: 'budgeting',
                    id: participationContextId,
                    type: participationContextType,
                  }
                : undefined,
          });
        } else if (!isNilOrError(authUser) && isBudgetingEnabled) {
          setProcessing(true);

          if (!isNilOrError(basket)) {
            let newIdeas: string[] = [];

            if (isInBasket) {
              newIdeas = basket.relationships.ideas.data
                .filter((basketIdea) => basketIdea.id !== idea.id)
                .map((basketIdea) => basketIdea.id);
            } else {
              newIdeas = [
                ...basket.relationships.ideas.data.map(
                  (basketIdea) => basketIdea.id
                ),
                idea.id,
              ];
            }

            try {
              await updateBasket(basket.id, {
                user_id: authUser.id,
                participation_context_id: participationContextId,
                participation_context_type: capitalizeParticipationContextType(
                  participationContextType
                ),
                idea_ids: newIdeas,
                submitted_at: null,
              });
              done();
              trackEventByName(tracks.ideaAddedToBasket);
            } catch (error) {
              done();
              streams.fetchAllWith({ dataId: [basket.id] });
            }
          } else {
            try {
              await addBasket({
                user_id: authUser.id,
                participation_context_id: participationContextId,
                participation_context_type: capitalizeParticipationContextType(
                  participationContextType
                ),
                idea_ids: [idea.id],
              });
              done();
              trackEventByName(tracks.basketCreated);
            } catch (error) {
              done();
            }
          }
        }
      }
    };

    if (
      !isUndefined(authUser) &&
      !isNilOrError(locale) &&
      !isNilOrError(tenant) &&
      !isNilOrError(idea) &&
      !isUndefined(basket) &&
      idea.attributes.budget
    ) {
      const basketIdeaIds = !isNilOrError(basket)
        ? basket.relationships.ideas.data.map((idea) => idea.id)
        : [];
      const isInBasket = includes(basketIdeaIds, ideaId);
      const isBudgetingEnabled =
        idea.attributes.action_descriptor.budgeting?.enabled;
      const isSignedIn = !!authUser;
      const budgetingDisabledReason =
        idea.attributes.action_descriptor.budgeting?.disabled_reason;
      const isPermitted = budgetingDisabledReason !== 'not_permitted';
      const hasBudgetingDisabledReason = !!idea.attributes.action_descriptor
        .budgeting?.disabled_reason;
      const isPBContext =
        participationContext?.attributes?.participation_method === 'budgeting';
      const isCurrentPhase =
        getCurrentPhase(phases)?.id === participationContext?.id;
      const isCurrent =
        (participationContextType === 'project' &&
          (participationContext as IProjectData).attributes
            .publication_status !== 'archived') ||
        isCurrentPhase;

      if (isPBContext) {
        const addRemoveButton =
          isCurrent && isPermitted ? (
            <Button
              onClick={handleAddRemoveButtonClick}
              disabled={
                isSignedIn && !isBudgetingEnabled && !hasBudgetingDisabledReason
              }
              processing={processing}
              bgColor={isInBasket ? colors.clRedError : colors.clGreen}
              iconSize="18px"
              icon={!isInBasket ? 'basket-plus' : 'basket-minus'}
              className={`e2e-assign-budget-button ${
                isInBasket ? 'in-basket' : 'not-in-basket'
              }`}
              ariaLabel={intl.formatMessage(
                !isInBasket
                  ? messages.addToMyExpenses
                  : messages.removeFromMyExpenses
              )}
            >
              <FormattedMessage
                {...(!isInBasket
                  ? view === 'ideaCard'
                    ? messages.add
                    : messages.addToMyExpenses
                  : view === 'ideaCard'
                  ? messages.remove
                  : messages.removeFromMyExpenses)}
              />
            </Button>
          ) : null;

        if (view === 'ideaCard') {
          return (
            <IdeaCardContainer
              className={`e2e-assign-budget ${className || ''}`}
              aria-live="polite"
            >
              {addRemoveButton}
            </IdeaCardContainer>
          );
        }

        if (view === 'ideaPage') {
          return (
            <IdeaPageContainer
              className={`pbAssignBudgetControlContainer e2e-assign-budget ${
                className || ''
              }`}
              aria-live="polite"
            >
              <BudgetWithButtonWrapper>
                <Budget>
                  <ScreenReaderOnly>
                    <FormattedMessage {...messages.a11y_price} />
                  </ScreenReaderOnly>
                  <FormattedNumber
                    value={idea.attributes.budget}
                    style="currency"
                    currency={tenant.attributes.settings.core.currency}
                    minimumFractionDigits={0}
                    maximumFractionDigits={0}
                  />
                </Budget>
                {addRemoveButton}
              </BudgetWithButtonWrapper>
              {isPermitted && (
                <StyledPBExpenses
                  participationContextId={participationContextId}
                  participationContextType={participationContextType}
                  viewMode="column"
                />
              )}
            </IdeaPageContainer>
          );
        }
      }
    }

    return null;
  }
);

const AssignBudgetControlWrapper = memo<OuterProps & InjectedIntlProps>(
  ({ view, projectId, ideaId, className, intl }) => {
    const authUser = useAuthUser();
    const tenant = useAppConfiguration();
    const locale = useLocale();
    const idea = useIdea({ ideaId });
    const project = useProject({ projectId });
    const phases = usePhases(projectId);

    const isContinuousProject =
      project?.attributes.process_type === 'continuous';
    const ideaPhaseIds = !isNilOrError(idea)
      ? idea?.relationships?.phases?.data?.map((item) => item.id)
      : null;
    const ideaPhases = !isNilOrError(phases)
      ? phases?.filter((phase) => includes(ideaPhaseIds, phase.id))
      : null;
    const latestRelevantIdeaPhase = ideaPhases
      ? getLatestRelevantPhase(ideaPhases)
      : null;
    const participationContext = isContinuousProject
      ? project
      : latestRelevantIdeaPhase;
    const participationContextType = isContinuousProject ? 'project' : 'phase';
    const participationContextId = participationContext?.id || null;

    if (
      !isUndefinedOrError(authUser) &&
      !isNilOrError(tenant) &&
      !isNilOrError(locale) &&
      !isNilOrError(idea) &&
      !isNilOrError(project) &&
      !isUndefinedOrError(phases) &&
      participationContext &&
      participationContextId
    ) {
      return (
        <AssignBudgetControl
          view={view}
          projectId={projectId}
          ideaId={ideaId}
          authUser={authUser}
          tenant={tenant.data}
          locale={locale}
          idea={idea}
          project={project}
          phases={phases}
          participationContext={participationContext}
          participationContextType={participationContextType}
          participationContextId={participationContextId}
          intl={intl}
          className={className}
        />
      );
    }

    return null;
  }
);

export default injectIntl<OuterProps>(AssignBudgetControlWrapper);

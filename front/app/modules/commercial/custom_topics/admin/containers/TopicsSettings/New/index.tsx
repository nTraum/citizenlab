import React from 'react';
import clHistory from 'utils/cl-router/history';

// intl
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// components
import GoBackButton from 'components/UI/GoBackButton';
import { Section, SectionTitle } from 'components/admin/Section';
import { Formik } from 'formik';
import TopicForm from '../TopicForm';

// services
import { addTopic, ITopicUpdate } from '../../../../services/topics';

// typings
import { CLErrorsJSON } from 'typings';

// utils
import { isCLErrorJSON } from 'utils/errorUtils';

interface Props {}

export default class New extends React.Component<Props> {
  handleSubmit = (
    values: ITopicUpdate,
    { setErrors, setSubmitting, setStatus }
  ) => {
    addTopic({
      ...values,
    })
      .then(() => {
        clHistory.push('/admin/settings/topics');
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  renderFn = (props) => {
    return <TopicForm {...props} />;
  };

  goBack = () => {
    clHistory.push('/admin/settings/topics');
  };

  initialValues = () => ({
    title_multiloc: {},
    description_multiloc: {},
  });

  render() {
    return (
      <Section>
        <GoBackButton onClick={this.goBack} />
        <SectionTitle>
          <FormattedMessage {...messages.addTopicButton} />
        </SectionTitle>
        <Formik
          initialValues={this.initialValues()}
          render={this.renderFn}
          onSubmit={this.handleSubmit}
        />
      </Section>
    );
  }
}

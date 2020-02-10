import React from 'react';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from '../messages';

// components
import { Form, Field, InjectedFormikProps } from 'formik';
import FormikInputMultiloc from 'components/UI/FormikInputMultiloc';
import FormikQuillMultiloc from 'components/UI/QuillEditor/FormikQuillMultiloc';
import FormikSubmitWrapper from 'components/admin/FormikSubmitWrapper';
import { Section, SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';

// Typings
import { Multiloc } from 'typings';

export interface Props {}

export interface FormValues {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
}

class AreaForm extends React.Component<InjectedFormikProps<Props & InjectedIntlProps, FormValues>> {
  render() {
    const { isSubmitting, errors, isValid, touched, status, intl: { formatMessage } } = this.props;

    return (
      <Form>
        <Section>
          <SectionField>
            <Field
              name="title_multiloc"
              component={FormikInputMultiloc}
              label={<FormattedMessage {...messages.fieldTitle} />}
              labelTooltipText={formatMessage(messages.fieldTitleTooltip)}
            />
            {touched.title_multiloc && <Error
              fieldName="title_multiloc"
              apiErrors={errors.title_multiloc as any}
            />}
          </SectionField>
          <SectionField>
            <Field
              component={FormikQuillMultiloc}
              name="description_multiloc"
              label={<FormattedMessage {...messages.fieldDescription} />}
              labelTooltipText={formatMessage(messages.fieldDescriptionTooltip)}
            />
            {touched.description_multiloc && <Error
              fieldName="description_multiloc"
              apiErrors={errors.description_multiloc as any}
            />}
          </SectionField>
        </Section>

        <FormikSubmitWrapper
          {...{ isValid, isSubmitting, status, touched }}
        />
      </Form>
    );
  }
}

export default injectIntl<Props>(AreaForm);

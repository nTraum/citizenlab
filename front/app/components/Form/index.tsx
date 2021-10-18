import React, { useState } from 'react';
import RJSForm, {
  AjvError,
  FieldProps,
  IChangeEvent,
  ISubmitEvent,
  UiSchema,
  WidgetProps,
} from '@rjsf/core';
import { JSONSchema7 } from 'json-schema';
import { FieldTemplate, ObjectFieldTemplate } from './UITemplate';
import TopicsPicker from 'components/UI/TopicsPicker';
import useTopics from 'hooks/useTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';
import { Box, Input, Select } from 'cl2-component-library';
import UserSelect from 'components/UI/UserSelect';
import { IOption } from 'typings';
import SubmitBar from './SubmitBar';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

export type TTemplate = 'default' | 'SectionForm';

export type TFormData = Record<string, any>;

interface Props {
  schema: JSONSchema7;
  uiSchema?: UiSchema;
  onChange?: (e: IChangeEvent<any>) => void;
  onSubmit: (e: ISubmitEvent<any>) => void;
  onError?: (any) => any;
}
// this doesn't work
const CustomSelect = (props: WidgetProps) => {
  console.log(props);
  if (props.uiSchema['ui:widget'] === 'TopicsPicker') {
    console.log('topicspicker');
    const topics = useTopics({});
    const filteredTopics = isNilOrError(topics)
      ? []
      : (topics.filter((topic) => !isNilOrError(topic)) as ITopicData[]);
    const onChange = (val) => props.onChange(val);
    return (
      <TopicsPicker
        selectedTopicIds={props.value}
        onChange={onChange}
        availableTopics={filteredTopics}
      />
    );
  }
  if (props.schema.type === 'string' || props.schema.type === 'number') {
    const selectedOption: IOption | null = props.value
      ? {
          value: props.value,
          label: props?.options?.enumOptions?.find(
            (enumOption) => enumOption.value === props.value
          ),
        }
      : null;

    const onChange = (selectedOption: IOption) => {
      props?.onChange?.(selectedOption ? selectedOption.value : null);
    };

    return (
      <Select
        value={selectedOption}
        options={props.options.enumOptions}
        onChange={onChange}
        key={props.id}
        id={props.id}
        disabled={props.disabled}
        aria-label={props.label}
        canBeEmpty={true}
      />
    );
  }
  return null;
};

// this doesn't work
const UserSelectWidget = (props: WidgetProps) => (
  <UserSelect
    id="author"
    inputId="author-select"
    value={props.value}
    onChange={props.onChange}
  />
);

// see https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/custom-widgets-fields/
// and citizenlab/front/app/modules/commercial/user_custom_fields/citizen/components/UserCustomFieldsForm/index.tsx

const widgets = {
  UserSelect: UserSelectWidget, // tried with new keys
  SelectWidget: CustomSelect, // tried with the right keys
};

const CustomInput = (props: FieldProps) => {
  const onChange = (value) => props.onChange(value);

  return (
    <Box flex="row">
      <Input
        type="text"
        value={props.formData}
        onChange={onChange}
        key={props.id}
        id={props.id}
        disabled={props.disabled}
      />
    </Box>
  );
};
const customFields = { StringField: CustomInput };

const transformErrorsToBe = (intl) => (errors: AjvError[]) => {
  console.log(errors);
  const errorn = errors.map((error: AjvError) => {
    if (error.name === 'required' || error.name === 'minLength')
      return { ...error, message: error.name };
    return error;
  });
  console.log(errorn);
  return errorn;
};

const Form = ({
  schema,
  uiSchema,
  onChange,
  onError,
  onSubmit,
  intl,
}: Props & InjectedIntlProps) => {
  const [loading, setLoading] = useState(false);
  // const [hasErrors, setHasErrors] = useState(false);
  const [formData, setFormData] = useState<TFormData | null>();

  const handleSubmit = (submitEvent) => {
    setFormData(submitEvent.formData);
    setLoading(true);
    onSubmit(submitEvent);
  };
  const transformErrors = transformErrorsToBe(intl);

  const extraErrors = {
    idea: {
      title_multiloc: {
        __errors: ['some error that got added as a prop'],
      },
    },
  };
  console.log(extraErrors);
  return (
    <RJSForm
      schema={schema}
      uiSchema={uiSchema}
      onSubmit={handleSubmit}
      onError={onError}
      onChange={onChange}
      widgets={widgets}
      formData={formData}
      fields={customFields}
      transformErrors={transformErrors}
      FieldTemplate={FieldTemplate}
      ObjectFieldTemplate={ObjectFieldTemplate}
      showErrorList={false}
      liveValidate={false}
      extraErrors={extraErrors}
    >
      <SubmitBar
        submitText="Submit ME"
        // hasErrors={hasErrors}
        loading={loading}
      />
    </RJSForm>
  );
};

export default injectIntl(Form);

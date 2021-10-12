import React, { useState } from 'react';
import RJSForm, {
  FieldProps,
  IChangeEvent,
  ISubmitEvent,
  UiSchema,
  WidgetProps,
} from 'react-jsonschema-form';
import { JSONSchema6 } from 'json-schema';
import { FieldTemplate, ObjectFieldTemplate } from './UITemplate';
import TopicsPicker from 'components/UI/TopicsPicker';
import useTopics from 'hooks/useTopics';
import { isNilOrError } from 'utils/helperUtils';
import { ITopicData } from 'services/topics';
import { Box, Input, Select } from 'cl2-component-library';
import UserSelect from 'components/UI/UserSelect';
import { IOption } from 'typings';
import MultipleSelect from 'components/UI/MultipleSelect';
import { forOwn } from 'lodash-es';

export type TTemplate = 'default' | 'SectionForm';

interface Props {
  schema: JSONSchema6;
  uiSchema?: UiSchema;
  onChange: (e: IChangeEvent<any>) => void;
  onSubmit: (e: ISubmitEvent<any>) => void;
  onError: (any) => any;
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
          label: props.options.enumOptions.find(
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

export default ({ schema, uiSchema, onChange, onSubmit, onError }: Props) => {
  const [formData, setFormData] = useState<Record<string, any> | null>();

  return (
    <RJSForm
      schema={schema}
      uiSchema={uiSchema}
      // onChange={handleChange}
      onSubmit={onSubmit}
      onError={onError}
      // liveValidate={false}
      widgets={widgets}
      fields={customFields}
      transformErrors={(e) => {
        console.log('transformErrors', e);
        return e;
      }}
      FieldTemplate={FieldTemplate}
      ObjectFieldTemplate={ObjectFieldTemplate}
    />
  );
};

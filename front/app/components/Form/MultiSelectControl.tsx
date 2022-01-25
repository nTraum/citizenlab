import { withJsonFormsControlProps } from '@jsonforms/react';
import {
  ControlProps,
  isPrimitiveArrayControl,
  JsonSchema7,
  RankedTester,
  rankWith,
} from '@jsonforms/core';
import React, { useState } from 'react';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import ErrorDisplay from './ErrorDisplay';
import { Box } from 'cl2-component-library';
import { FormLabel } from 'components/UI/FormComponents';
import { getLabel, sanitizeForClassname } from 'utils/JSONFormUtils';
import styled from 'styled-components';
import MultipleSelect from 'components/UI/MultipleSelect';

const StyledMultipleSelect = styled(MultipleSelect)`
  flex-grow: 1;
`;

interface ControlPropsV7 extends ControlProps {
  schema: JsonSchema7;
}

const MultiSelectControl = ({
  data,
  handleChange,
  path,
  errors,
  schema,
  uischema,
  required,
  id,
}: ControlPropsV7 & InjectedIntlProps) => {
  const [didBlur, setDidBlur] = useState(false);
  const options =
    (!Array.isArray(schema.items) &&
      schema.items?.oneOf?.map((o) => ({
        value: o.const as string,
        label: (o.title || o.const) as string,
      }))) ||
    null;

  return (
    <>
      <FormLabel
        htmlFor={sanitizeForClassname(id)}
        labelValue={getLabel(uischema, schema, path)}
        optional={!required}
        subtextValue={schema.description}
        subtextSupportsHtml
      />
      <Box display="flex" flexDirection="column" overflow="visible">
        <StyledMultipleSelect
          value={data}
          options={options}
          onChange={(vals) => {
            setDidBlur(true);
            handleChange(
              path,
              vals.map((val) => val.value)
            );
          }}
          inputId={sanitizeForClassname(id)}
        />
        <ErrorDisplay ajvErrors={errors} fieldPath={path} didBlur={didBlur} />
      </Box>
    </>
  );
};
// {props.options.verificationLocked && (
//   <IconTooltip
//     content={<FormattedMessage {...messages.blockedVerified} />}
//     icon="lock"
//   />
// )}

export default withJsonFormsControlProps(injectIntl(MultiSelectControl));

export const multiSelectControlTester: RankedTester = rankWith(
  4,
  isPrimitiveArrayControl
);

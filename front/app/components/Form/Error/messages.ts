import { defineMessages } from 'react-intl';

export default defineMessages({
  required: {
    id: 'app.errors.required',
    defaultMessage: 'Please provide a {fieldName}.',
  },
  minLength: {
    id: 'app.errors.minLength',
    defaultMessage:
      'The {fieldName} must be at least {minLength} characters long.',
  },
});

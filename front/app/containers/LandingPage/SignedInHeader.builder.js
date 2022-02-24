import { Builder } from '@builder.io/react';
import { SignedInHeader } from './SignedInHeader';

Builder.registerComponent(SignedInHeader, {
  name: 'SignedInHeader',
  tenant: 'f0658ced-9297-4850-bede-4ccb085f101a',
  inputs: [
    {
      name: 'text1',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'tenant',
      type: 'string',
      defaultValue: 'f0658ced-9297-4850-bede-4ccb085f101a',
    },
  ],
});

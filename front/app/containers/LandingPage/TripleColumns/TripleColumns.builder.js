import { Builder } from '@builder.io/react';
import { CustomComponent } from './TripleColumns';

Builder.registerComponent(CustomComponent, {
  name: 'CustomComponent',
  image:
    'https://cdn.builder.io/api/v1/image/assets%2FYJIGb4i01jvw0SRdL5Bt%2F99756b9cb8c343dc8bed72186c545eeb',
  inputs: [
    {
      name: 'text1',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image1',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
    {
      name: 'text2',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image2',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
    {
      name: 'text3',
      type: 'string',
      defaultValue: 'Your Title Here',
    },
    {
      name: 'image3',
      type: 'file',
      allowedFileTypes: ['jpeg', 'jpg', 'png', 'svg'],
      required: true,
      defaultValue:
        'https://cdn.builder.io/api/v1/image/assets%2Fpwgjf0RoYWbdnJSbpBAjXNRMe9F2%2Ffb27a7c790324294af8be1c35fe30f4d',
    },
  ],
});

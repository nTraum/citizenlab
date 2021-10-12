import React from 'react';
import Form, { TTemplate } from 'components/Form';

import { JSONSchema6TypeName } from 'json-schema';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  display: 'flex';
  flex-direction: column;
  align-items: center;
  padding-bottom: 100px;
  padding-right: 20px;
  padding-left: 20px;
  margin-left: auto;
  margin-right: auto;

  ${media.smallerThanMaxTablet`
    padding-bottom: 80px;
    padding-right: 0;
    padding-left: 0;
  `}
`;

const PageContainer = styled.main`
  width: 100%;
  min-height: calc(
    100vh - ${(props) => props.theme.menuHeight + props.theme.footerHeight}px
  );
  position: relative;

  ${media.smallerThanMaxTablet`
    min-height: calc(100vh - ${(props) => props.theme.mobileMenuHeight}px - ${(
    props
  ) => props.theme.mobileTopBarHeight}px);
  `}
`;

const schema = {
  type: 'object' as JSONSchema6TypeName,
  title: 'Add New Idea',
  properties: {
    idea: {
      title: "What's your idea ?",
      type: 'object' as JSONSchema6TypeName,
      properties: {
        title: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Title',
          minLength: 10,
          maxLength: 80,
        },
        author: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Author',
        },
        description: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Description',
          minLength: 30,
        },
      },
      required: ['title', 'description', 'author'],
    },
    details: {
      title: 'Details',
      type: 'object' as JSONSchema6TypeName,
      properties: {
        topics: {
          type: 'array' as JSONSchema6TypeName,
          items: {
            type: 'string' as JSONSchema6TypeName,
          },
        },
        // location: {
        //   type: "array" as JSONSchema6TypeName,
        //   items: {
        //     type: "string" as JSONSchema6TypeName
        //   }
        // }
      },
    },
  },
  required: ['idea'],
};

const uiSchema = {
  Template: 'SectionForm' as TTemplate,
  idea: {
    author: {
      'ui:widget': 'UserSelect',
    },
  },
  details: {
    topics: {
      'ui:widget': 'CustomSelect',
    },
  },
  // "location": {
  //   "ui:widget": "LocationPicker"
  // }
};

export default () => {
  return (
    <PageContainer>
      <Container id="e2e-new-idea-form">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          // onChange={(e) => console.log('Parent:onChange', e)}
          // onSubmit={(e) => console.log('Parent:onSubmit', e)}
          // onError={(e) => console.log('Parent:onError', e)}
        />
      </Container>
    </PageContainer>
  );
};

import React from 'react';
import Form, { TFormData, TTemplate } from 'components/Form';

import { JSONSchema6TypeName } from 'json-schema';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { ISubmitEvent } from 'react-jsonschema-form';
import { addIdea, IIdeaAdd } from 'services/ideas';

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
  title_multiloc: 'Add New Idea',
  properties: {
    idea: {
      title: "What's your idea ?",
      type: 'object' as JSONSchema6TypeName,
      properties: {
        title_multiloc: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Title',
          minLength: 10,
          maxLength: 80,
        },
        author: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Author',
        },
        body_multiloc: {
          type: 'string' as JSONSchema6TypeName,
          title: 'Description',
          minLength: 30,
        },
      },
      required: ['title_multiloc', 'body_multiloc', 'author'],
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
};

// notes :
// On multiloc fields (like title_multiloc and description) there are several options :
// - use a widget that populates the multiloc
// - handle strings in submit to transform into multiloc
// - send the strig as is with the locale and let back-end localize
// -> prefer one as some fields could be shown as multiloc with or without locale switcher
// -> last one is interresting as it could verify the language match

const uiSchema = {
  Template: 'SectionForm' as TTemplate,
  idea: {
    author_id: {
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

export default ({ projectId }) => {
  const onSubmit = async ({ formData }: ISubmitEvent<TFormData>) => {
    console.log(formData);
    // now I'm making no change to BE so I'll flaten the data to pass it back in the expected format
    // should switch that to BE at term ?
    const ideaObject: IIdeaAdd = {
      author_id: formData.idea.author_id,
      publication_status: 'published',
      title_multiloc: { en: formData.idea.title_multiloc },
      body_multiloc: { en: formData.idea.body_multiloc },
      topic_ids: [],
      project_id: projectId,
      location_description: null,
      location_point_geojson: null,
      budget: null,
      proposed_budget: null,
    };
    try {
      const idea = await addIdea(ideaObject);
    } catch (error) {
      console.log(error?.json?.errors);
    }
  };

  const onError = ({ e }) => {
    console.log(e);
  };

  return (
    <PageContainer>
      <Container id="e2e-new-idea-form">
        <Form
          schema={schema}
          uiSchema={uiSchema}
          // onChange={(e) => console.log('Parent:onChange', e)}
          onSubmit={onSubmit}
          onError={onError}
        />
      </Container>
    </PageContainer>
  );
};

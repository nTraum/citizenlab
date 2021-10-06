import React, { useState } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import { Input, Box } from 'cl2-component-library';
import Button from 'components/UI/Button';
import { SectionField } from 'components/admin/Section';
import Error from 'components/UI/Error';
import Tag from 'modules/commercial/insights/admin/components/Tag';

// utils
import { isNilOrError } from 'utils/helperUtils';

// styles
import styled from 'styled-components';
import { fontSizes, colors } from 'utils/styleUtils';

// intl
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../../messages';

// typings
import { CLErrors } from 'typings';

// hooks
import useInsightsCategories from 'modules/commercial/insights/hooks/useInsightsCategories';

type CreateCategoryProps = {
  closeCreateModal: () => void;
} & WithRouterProps &
  InjectedIntlProps;

const Title = styled.h1`
  text-align: center;
  font-size: ${fontSizes.xxl}px;
`;

const Description = styled.p`
  text-align: center;
  padding-top: 10px;
  font-size: ${fontSizes.base}px;
`;

const CreateCategory = ({
  closeCreateModal,
  intl: { formatMessage },
  params: { viewId },
  location: { query },
}: CreateCategoryProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<CLErrors | undefined>();

  const [name, setName] = useState<string | null>();
  const onChangeName = (value: string) => {
    setName(value);
    setErrors(undefined);
  };

  const categories = useInsightsCategories(viewId);

  if (isNilOrError(categories)) {
    return null;
  }

  const queryCategories: string[] = query.categories
    ? typeof query.categories === 'string'
      ? [query.categories]
      : query.categories
    : [];

  const keywords: string[] = query.keywords
    ? typeof query.keywords === 'string'
      ? [query.keywords]
      : query.keywords
    : [];

  const selectedCategories = categories.filter((category) =>
    queryCategories.includes(category.id)
  );

  const handleSubmit = async () => {
    if (name) {
      setLoading(true);
      try {
        //    const result = await addInsightsView({ name, scope_id: projectScope });
        // if (!isNilOrError(result)) {
        //   closeCreateModal();
        // }
      } catch (errors) {
        setErrors(errors.json.errors);
        setLoading(false);
      }
    }
  };

  return (
    <Box
      w="100%"
      maxWidth="350px"
      m="40px auto"
      color={colors.adminTextColor}
      data-testid="insightsCreateCategory"
    >
      <Title>{formatMessage(messages.createCategoryTitle)}</Title>
      <Description>
        {formatMessage(messages.createCategoryDescription)}
      </Description>

      <Box mb="10px" display="flex" justifyContent="center">
        {selectedCategories.map((category) => (
          <Tag
            key={category.id}
            mr="4px"
            mb="4px"
            variant="primary"
            label={category.attributes.name}
          />
        ))}
      </Box>
      <Box display="flex" justifyContent="center">
        {keywords.map((keyword: string) => (
          <Tag
            key={keyword}
            mr="4px"
            mb="4px"
            variant="secondary"
            label={keyword.substring(keyword.indexOf('/') + 1)}
          />
        ))}
      </Box>
      <Box as="form" mt="50px">
        <SectionField>
          <Input
            type="text"
            id="category_name"
            value={name}
            onChange={onChangeName}
            label={formatMessage(messages.createCategoryInputLabel)}
          />
          {errors && (
            <Error apiErrors={errors['name']} fieldName="category_name" />
          )}
        </SectionField>

        <Box display="flex" justifyContent="center">
          <Button
            processing={loading}
            disabled={!name}
            onClick={handleSubmit}
            bgColor={colors.adminTextColor}
          >
            {formatMessage(messages.createCategoryConfirm)}
          </Button>
          <Button onClick={closeCreateModal} buttonStyle="secondary" ml="5px">
            {formatMessage(messages.createCategoryCancel)}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default injectIntl(withRouter(CreateCategory));

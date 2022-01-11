import React from 'react';

// components
import Error from 'components/UI/Error';
import { IconTooltip } from '@citizenlab/cl2-component-library';
import { SubSectionTitle } from 'components/admin/Section';
import {
  StyledSectionField,
  StyledWarning,
  StyledInput,
  SlugPreview,
} from './styling';

import useLocale from 'hooks/useLocale';
import useAppConfiguration from 'hooks/useAppConfiguration';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { CLErrors } from 'typings';

import { isNilOrError } from 'utils/helperUtils';

interface Props {
  slug: string | null;
  resource: 'project' | 'folder';
  apiErrors: CLErrors;
  showSlugErrorMessage: boolean;
  handleSlugOnChange: (slug: string) => void;
}

const SlugInput = ({
  slug,
  resource,
  apiErrors,
  showSlugErrorMessage,
  handleSlugOnChange,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const locale = useLocale();
  const currentTenant = useAppConfiguration();

  if (isNilOrError(currentTenant)) return null;

  return (
    <StyledSectionField>
      <SubSectionTitle>
        <FormattedMessage {...messages.projectUrl} />
        <IconTooltip
          content={
            <FormattedMessage
              {...messages.projectUrlSlugTooltip}
              values={{
                currentURL: (
                  <em>
                    <b>
                      {currentTenant.data.attributes.host}/{locale}
                      /projects/{slug}
                    </b>
                  </em>
                ),
                currentSlug: (
                  <em>
                    <b>{slug}</b>
                  </em>
                ),
              }}
            />
          }
        />
      </SubSectionTitle>
      <StyledWarning>
        <FormattedMessage
          {...(resource === 'folder'
            ? messages.folderUrlSlugBrokenLinkWarning
            : messages.projectUrlSlugBrokenLinkWarning)}
        />
      </StyledWarning>
      <StyledInput
        id={resource === 'folder' ? 'folder-slug' : 'project-slug'}
        type="text"
        label={
          <FormattedMessage
            {...(resource === 'folder'
              ? messages.folderUrlSlugLabel
              : messages.projectUrlSlugLabel)}
          />
        }
        onChange={handleSlugOnChange}
        value={slug}
      />
      <SlugPreview>
        <b>
          {formatMessage(
            resource === 'folder'
              ? messages.folderResultingURL
              : messages.projectResultingURL
          )}
        </b>
        : {currentTenant?.data.attributes.host}/{locale}/projects/
        {slug}
      </SlugPreview>
      {/* Backend error */}
      <Error fieldName="slug" apiErrors={apiErrors.slug} />
      {/* Frontend error */}
      {showSlugErrorMessage && (
        <Error text={formatMessage(messages.regexError)} />
      )}
    </StyledSectionField>
  );
};

export default injectIntl(SlugInput);

import React from 'react';

// components
import Button from 'components/UI/Button';
import Error from 'components/UI/Error';
import ButtonBar from 'components/ButtonBar';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// style
import styled from 'styled-components';

const ButtonBarInner = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  align-items: center;
  padding-right: 20px;
  padding-left: 20px;

  .Button {
    margin-right: 10px;
  }

  .Error {
    flex: 1;
  }
`;

export default ({ submitText, hasErrors = false, loading }) => {
  return (
    <ButtonBar>
      <ButtonBarInner>
        <Button
          id="e2e-idea-new-submit-button"
          className="e2e-submit-idea-form"
          processing={loading}
          text={submitText}
        />
        {hasErrors && (
          <Error
            text={'Please fix your mistakes.'}
            marginTop="0px"
            showBackground={false}
            showIcon={true}
          />
        )}
      </ButtonBarInner>
    </ButtonBar>
  );
};

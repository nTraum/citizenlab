import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Locale, Multiloc } from 'typings';
import Link from 'utils/cl-router/Link';

type ContentBuilderToggleProps = {
  valueMultiloc: Multiloc | undefined | null;
  onChange: (description_multiloc: Multiloc, _locale: Locale) => void;
  label: string;
  labelTooltipText: string;
} & WithRouterProps;

const ContentBuilderToggle = ({
  location: { pathname },
  valueMultiloc,
  onChange,
  label,
  labelTooltipText,
}: ContentBuilderToggleProps) => {
  const route = `${pathname}/content-builder`;
  return (
    <>
      <Link to={route}>Advanced Editor</Link>
      <QuillMultilocWithLocaleSwitcher
        id="project-description"
        valueMultiloc={valueMultiloc}
        onChange={onChange}
        label={label}
        labelTooltipText={labelTooltipText}
        withCTAButton
      />
    </>
  );
};

export default withRouter(ContentBuilderToggle);

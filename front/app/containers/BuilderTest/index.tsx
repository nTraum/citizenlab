import { BuilderComponent, builder } from '@builder.io/react';
import React from 'react';
import { useEffect, useState } from 'react';

builder.init('7b78e1a1ad944f6dbe06cd71d7941555');

export let BuilderPage = () => {
  const [pageJson, setPage] = useState(undefined);

  useEffect(() => {
    builder
      .get('builder-test', { url: '/builder-test' })
      .promise()
      .then(setPage);
  }, []);

  console.log('RETURN:');
  console.log(pageJson);

  return <BuilderComponent model="builder-test" content={pageJson} />;
};

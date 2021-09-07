import { API_HOST, API_PORT } from 'containers/App/constants';
import { createConsumer } from '@rails/actioncable';
import { getJwt } from 'utils/auth/jwt';

import * as ActionCable from '@rails/actioncable';

ActionCable.logger.enabled = true;

const getWebSocketURL = () => {
  const token = getJwt();
  console.log(token);
  return `ws:${API_HOST}:${API_PORT}/cable?token=${token}`;
};

// Use a function to dynamically generate the URL
const consumer = createConsumer(getWebSocketURL());

export default consumer;

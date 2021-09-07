import { API_PATH } from 'containers/App/constants';
import { createConsumer } from '@rails/actioncable';
import { getJwt } from 'utils/auth/jwt';

const getWebSocketURL = () => {
  const token = getJwt();
  console.log(token);
  return `${API_PATH}/cable?token=${token}`;
};

// Use a function to dynamically generate the URL
const consumer = createConsumer(getWebSocketURL());

export default consumer;

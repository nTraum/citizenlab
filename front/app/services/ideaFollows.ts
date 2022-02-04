/* eslint detect-deadcode: "off", curly: "error" */
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { uuidRegExp } from 'utils/helperUtils';

// export type TVoteMode = 'up' | 'down';

export interface IIdeaFollowData {
  id: string;
  type: 'ideaFollow';

  relationships: {
    idea: {
      data: {
        id: string;
        type: 'idea';
      };
    };
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

interface ILinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IIdeaFollows {
  data: IIdeaFollowData[];
  links: ILinks;
}

export interface IIdeaFollow {
  data: IIdeaFollowData;
}

export interface INewFollowProperties {
  user_id?: string;
}

export function followStream(
  followId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeaFollow>({
    apiEndpoint: `${API_PATH}/follows/${followId}`,
    ...streamParams,
  });
}

export function followsStream(
  ideaId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IIdeaFollows>({
    apiEndpoint: `${API_PATH}/ideas/${ideaId}/follows`,
    ...streamParams,
  });
}

export async function addFollow(
  ideaId: string,
  object: INewFollowProperties,
  refetchAllActiveIdeas = false
) {
  const response = await streams.add<IIdeaFollow>(
    `${API_PATH}/ideas/${ideaId}/follows`,
    { follow: object }
  );

  if (refetchAllActiveIdeas) {
    const ideaEndpointRegexp = new RegExp(`/ideas/${uuidRegExp}$`);
    streams.fetchAllWith({
      regexApiEndpoint: [ideaEndpointRegexp],
      onlyFetchActiveStreams: true,
    });
  }

  return response;
}

export async function deleteFollow(
  _ideaId,
  followId: string,
  refetchAllActiveIdeas = false
) {
  const response = await streams.delete(
    `${API_PATH}/follows/${followId}`,
    followId
  );

  if (refetchAllActiveIdeas) {
    const ideaEndpointRegexp = new RegExp(`/ideas/${uuidRegExp}$`);
    streams.fetchAllWith({
      regexApiEndpoint: [ideaEndpointRegexp],
      onlyFetchActiveStreams: true,
    });
  }

  return response;
}

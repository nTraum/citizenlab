import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IPageData } from './pages';

export const apiEndpoint = `${API_PATH}/navbar_items`;

export interface INavbarItem {
  id: string;
  type: string;
  attributes: {
    type: string;
    title_multiloc: Multiloc;
    visible: boolean;
    ordering: number;
    page: IPageData;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    page: {
      data: IRelationship[];
    };
  };
}

export interface INavbarItemsStreamParams {
  visible?: boolean;
}

export function navbarItemsStream(
  navbarItemsStreamParams?: INavbarItemsStreamParams
) {
  return streams.get<{ data: INavbarItem[] }>({
    apiEndpoint: `${apiEndpoint}`,
    queryParameters: navbarItemsStreamParams,
  });
}

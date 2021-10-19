import { IRelationship, Multiloc } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/pages`;

// This is only relevant for non-commercial customers: they can edit the
// content of these pages, but nothing else. For commercial customers,
// these are just 'custom' pages
type TStandardPage = 'information' | 'faq';

export const STANDARD_PAGES: TStandardPage[] = ['information', 'faq'];

// Policy pages of which only the content can be edited
// in 'policy' tab in settings (both for non-commercial and
// commercial customers)
type TPolicyPage = 'terms-and-conditions' | 'privacy-policy';

export const POLICY_PAGES: TPolicyPage[] = [
  'terms-and-conditions',
  'privacy-policy',
];

// Pages in the footer (confusingly, cookie-policy is not a policy page
// since it doesn't show up in the 'policies' tab)
export type TFooterPage = TPolicyPage | 'cookie-policy';

export const FOOTER_PAGES: TFooterPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
];

// Pages that do not have a corresponding navbar item
export type TFixedPage =
  | TPolicyPage
  | 'cookie-policy'
  | 'homepage-info'
  | 'initiatives'
  | 'initiatives-success-1'
  | 'initiatives-success-2'
  | 'initiatives-success-3';

export const FIXED_PAGES: TFixedPage[] = [
  'terms-and-conditions',
  'privacy-policy',
  'cookie-policy',
  'homepage-info',
  'initiatives',
  'initiatives-success-1',
  'initiatives-success-2',
  'initiatives-success-3',
];

type TPublicationStatus = 'draft' | 'published';

export interface IPageData {
  id: string;
  type: 'page';
  attributes: {
    title_multiloc: Multiloc;
    body_multiloc: Multiloc;
    slug: // to be found in cl2-back: config/tenant_templates/base.yml
    | null // for default pages (home, projects etc)
      | TStandardPage
      | TFixedPage
      | string; // for user-created pages;
    publication_status: TPublicationStatus;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    navbar_item: {
      data: IRelationship | null;
    };
    page_links: {
      data: IRelationship[];
    };
  };
}

export interface PageLink {
  type: 'page_links';
  id: string;
  attributes: {
    linked_page_slug: string;
    linked_page_title_multiloc: Multiloc;
    ordering: number;
  };
}

// interface IPageCreate {
//   title_multiloc: Multiloc;
//   body_multiloc: Multiloc;
//   slug: string;
//   publication_status: TPublicationStatus;
//   navbar_item_attributes: {
//     title_multiloc: Multiloc;
//   };
// }

// Update this in page edit iteration
interface IPageCreate {
  title_multiloc: Multiloc;
  body_multiloc: Multiloc;
  slug: string;
}

export interface IPageUpdate {
  title_multiloc?: Multiloc;
  body_multiloc?: Multiloc;
  slug?: string;
  publication_status?: TPublicationStatus;
}

export interface IPage {
  data: IPageData;
}

export function listPages(streamParams: IStreamParams | null = null) {
  return streams.get<{ data: IPageData[] }>({
    apiEndpoint: `${apiEndpoint}`,
    ...streamParams,
  });
}

export function pageBySlugStream(
  pageSlug: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/by_slug/${pageSlug}`,
    ...streamParams,
  });
}

export function createPage(pageData: IPageCreate) {
  return streams.add<IPage>(`${apiEndpoint}`, pageData);
}

export function updatePage(pageId: string, pageData: IPageUpdate) {
  return streams.update<IPage>(`${apiEndpoint}/${pageId}`, pageId, pageData);
}

export async function deletePage(pageId: string) {
  const response = await streams.delete(`${apiEndpoint}/${pageId}`, pageId);
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/navbar_items`] });

  return response;
}

export function pageByIdStream(
  pageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPage>({
    apiEndpoint: `${apiEndpoint}/${pageId}`,
    ...streamParams,
  });
}

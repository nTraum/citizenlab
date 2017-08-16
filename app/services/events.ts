import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import request from 'utils/request';
import { Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/events`;

export interface EventData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    location_multiloc: Multiloc;
    start_at: string;
    end_at: string;
    created_at: string;
    updated_at: string;
  };
  relationships: {
    project: {
      data: {
        id: string;
        type: string;
      }
    }
  };
}

export interface Event {
  data: EventData;
}

export interface Events {
  data: EventData[];
}

export interface UpdatedEvent {
  project_id?: string;
  title_multiloc?: { [key: string]: string };
  description_multiloc?: { [key: string]: string };
  start_at?: string;
  end_at?: string;
}

export function observeEvents(projectId: string, streamParams: IStreamParams<Events> | null = null) {
  return streams.create<Events>({ apiEndpoint: `${API_PATH}/projects/${projectId}/events`, ...streamParams });
}

export function observeEvent(eventId: string, streamParams: IStreamParams<Event> | null = null) {
  return streams.create<Event>({ apiEndpoint: `${apiEndpoint}/${eventId}`, ...streamParams });
}

export function updateEvent(eventId: string, object: UpdatedEvent, refetch = true) {
  const httpMethod = { method: 'PUT' };
  const bodyData = { phase: object };

  return request<Event>(`${apiEndpoint}/${eventId}`, bodyData, httpMethod, null).then((response) => {
    streams.update(eventId, response, refetch);
  }).catch((error) => {
    throw new Error(`error for updateEvent() of service Events`);
  });
}

export function saveEvent(projectId: string, object: UpdatedEvent, refetch = true) {
  const httpMethod = { method: 'POST' };
  const bodyData = { event: object };

  return request<Event>(`${API_PATH}/projects/${projectId}/events`, bodyData, httpMethod, null)
  .catch((error) => {
    throw new Error(`error for saveEvent() of service Events`);
  });
}

export function deleteEvent(eventId: string, httpOptions = {}): Promise<any> {
  const defaultOptions = { method: 'DELETE' };

  return request(`${apiEndpoint}/${eventId}`, null, { ...defaultOptions, ...httpOptions }, null);
}

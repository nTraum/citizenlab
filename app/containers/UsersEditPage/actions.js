/*
 *
 * UsersEditPage actions
 *
 */

import {
  CURRENT_USER_LOAD_SUCCESS, CURRENT_USER_LOAD_ERROR, STORE_AVATAR, CURRENT_USER_STORE_SUCCESS,
  CURRENT_USER_STORE_ERROR, STORE_CURRENT_USER, AVATAR_STORE_ERROR,
} from './constants';

export function currentUserLoaded(currentUser) {
  currentUser.data.attributes.avatar = '';

  return {
    type: (currentUser && currentUser.data
      ? CURRENT_USER_LOAD_SUCCESS
      : CURRENT_USER_LOAD_ERROR),
    payload: currentUser && currentUser.data && currentUser.data.attributes,
  };
}

export function currentUserLoadError() {
  return {
    type: CURRENT_USER_LOAD_ERROR,
  };
}

export function updateCurrentUser(currentUser) {
  return {
    type: STORE_CURRENT_USER,
    payload: currentUser,
  };
}

export function currentUserUpdated(currentUser) {
    const validResponse = currentUser && currentUser.data;

    return {
      type: (validResponse
          ? CURRENT_USER_LOAD_SUCCESS
          : CURRENT_USER_LOAD_ERROR),
      payload: validResponse && currentUser.data.attributes,
  };
}

export function storeCurrentUserError() {
  return {
    type: CURRENT_USER_STORE_ERROR,
  };
}

export function storeAvatar(avatarBase64) {
  return {
    type: STORE_AVATAR,
    avatarBase64,
  };
}

export function avatarStoreError() {
  return {
    type: AVATAR_STORE_ERROR,
  };
}

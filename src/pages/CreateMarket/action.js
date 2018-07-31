import { SET_DATA } from '@/stores/data-action';

export const updateEmail = (value) => {
  return SET_DATA({
    type: 'CREATE_MARKET:UPDATE_EMAIL',
    _path: 'auth.profile.email',
    _value: value,
  });
};

export const loadReports = (payload = {}) => {
  return {
    type: 'CREATE_MARKET:LOAD_REPORTS',
    ...payload,
  };
}
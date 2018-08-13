import { takeLatest, call, select, put } from 'redux-saga/effects';
import { apiGet } from '@/stores/api-saga';
import { REMOVE_DATA } from '@/stores/data-action';
import { API_URL } from '@/constants';
import { loadMatches, getReportCount, removeExpiredEvent } from './action';
import { eventSelector } from './selector';

export function* handleLoadMatches({ cache = true }) {
  try {
    if (cache) {
      const events = yield select(eventSelector);
      if (events && events.length) {
        return events;
      }
    }

    return yield call(apiGet, {
      PATH_URL: API_URL.CRYPTOSIGN.LOAD_MATCHES,
      type: 'LOAD_MATCHES',
      _key: 'events',
      _path: 'prediction',
    });
  } catch (e) {
    return console.error('handleLoadMachesSaga', e);
  }
}

export function* handleRemoveEvent({ eventId }) {
  try {
    const events = yield select(eventSelector);
    if (events && events.length) {
      const index = events.findIndex((item) => item.id === eventId);
      console.log('eventId', eventId, typeof eventId);
      console.log('index', index);
      console.log('events', events);
      if (index >= 0) {
        yield put(REMOVE_DATA({
          _path: 'prediction.events',
          _value: [index],
        }));
      }
    }
  } catch (e) {
    console.error(e);
  }
}

export function* handleCountReport() {
  try {
    return yield call(apiGet, {
      PATH_URL: API_URL.CRYPTOSIGN.COUNT_REPORT,
      type: 'COUNT_REPORT',
      _key: 'countReport',
      _path: 'ui',
    });
  } catch (e) {
    return console.error('handleCountReport', e);
  }
}


export default function* predictionSaga() {
  yield takeLatest(loadMatches().type, handleLoadMatches);
  yield takeLatest(getReportCount().type, handleCountReport);
  yield takeLatest(removeExpiredEvent().type, handleRemoveEvent);

}

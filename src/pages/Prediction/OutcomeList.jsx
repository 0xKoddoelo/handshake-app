import React from 'react';
import propTypes from 'prop-types';
import ScrollableList from '@/components/ScrollableList/ScrollableList';
import { generatedBackgroundCss } from '@/utils/css.js';
import { smartTrim } from '@/utils/string';

const BACKGROUND_COLORS = [
  '#000000',
  '#FF2D55',
  '#9C27B0',
  '#007AFF',
  '#FF9500',
  '#009688',
  '#843CF6',
  '#381CE2',
  '#9D61FD',
  '#D5E969',
];

function buildOutcomeItem(outcome) {
  const styleCss = {
    background: generatedBackgroundCss(null, BACKGROUND_COLORS),
  };
  const handledStr = smartTrim(outcome.name, outcome.name.length / 2);
  return (
    <div className="OutcomeItem" style={styleCss}>
      <span>{handledStr[0]}</span>
      <span>{handledStr[1]}</span>
    </div>
  );
}

function OutcomeList(props) {
  const { event, onClick } = props;
  const { outcomes } = event;
  return (
    <div className="OutcomeList">
      <ScrollableList
        data={outcomes}
        event={event}
        itemRenderer={(outcome) => buildOutcomeItem(outcome, event)}
        onClickItem={onClick}
      />
    </div>
  );
}

OutcomeList.propTypes = {
  event: propTypes.object,
  onClick: propTypes.func,
};

OutcomeList.defaultProps = {
  event: null,
  onClick: undefined,
};

export default OutcomeList;

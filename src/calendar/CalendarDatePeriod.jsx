import React from 'react';

import BemMixin from '../utils/BemMixin';
import PureRenderMixin from '../utils/PureRenderMixin';


const CalendarDatePeriod = React.createClass({
  mixins: [BemMixin, PureRenderMixin],

  propTypes: {
    color: React.PropTypes.string,
    period: React.PropTypes.string,
    className: React.PropTypes.string,
  },

  render() {
    let { color, period, className } = this.props;
    let modifiers = { [period]: true };
    let style;

    if (color) {
      style = { backgroundColor: color };
    }

    let c = this.cx({ modifiers });
    if (className) {
      c += ' ' + className;
    }

    return (
      <div style={style} className={c} />
    );
  },
});

export default CalendarDatePeriod;

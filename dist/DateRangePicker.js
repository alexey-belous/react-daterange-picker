'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

require('moment-range');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _calendar = require('calendar');

var _calendar2 = _interopRequireDefault(_calendar);

var _BemMixin = require('./utils/BemMixin');

var _BemMixin2 = _interopRequireDefault(_BemMixin);

var _CustomPropTypes = require('./utils/CustomPropTypes');

var _CustomPropTypes2 = _interopRequireDefault(_CustomPropTypes);

var _Legend = require('./Legend');

var _Legend2 = _interopRequireDefault(_Legend);

var _CalendarMonth = require('./calendar/CalendarMonth');

var _CalendarMonth2 = _interopRequireDefault(_CalendarMonth);

var _CalendarDate = require('./calendar/CalendarDate');

var _CalendarDate2 = _interopRequireDefault(_CalendarDate);

var _PaginationArrow = require('./PaginationArrow');

var _PaginationArrow2 = _interopRequireDefault(_PaginationArrow);

var _isMomentRange = require('./utils/isMomentRange');

var _isMomentRange2 = _interopRequireDefault(_isMomentRange);

var _hasUpdatedValue = require('./utils/hasUpdatedValue');

var _hasUpdatedValue2 = _interopRequireDefault(_hasUpdatedValue);

var _getYearMonth = require('./utils/getYearMonth');

var _reactAddonsPureRenderMixin = require('react-addons-pure-render-mixin');

var _reactAddonsPureRenderMixin2 = _interopRequireDefault(_reactAddonsPureRenderMixin);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var absoluteMinimum = (0, _moment2.default)(new Date(-8640000000000000 / 2)).startOf('day');
var absoluteMaximum = (0, _moment2.default)(new Date(8640000000000000 / 2)).startOf('day');

function noop() {}

var contains = function contains(range, d) {
  var oD = d.valueOf();

  var startInRange = range.start.valueOf() <= oD;
  var endInRange = range.end.valueOf() >= oD;

  return startInRange && endInRange;
};

var DateRangePicker = _react2.default.createClass({
  displayName: 'DateRangePicker',

  mixins: [_BemMixin2.default, _reactAddonsPureRenderMixin2.default],

  propTypes: {
    bemBlock: _react2.default.PropTypes.string,
    bemNamespace: _react2.default.PropTypes.string,
    className: _react2.default.PropTypes.string,
    dateStates: _react2.default.PropTypes.array, // an array of date ranges and their states
    defaultState: _react2.default.PropTypes.string,
    disableNavigation: _react2.default.PropTypes.bool,
    firstOfWeek: _react2.default.PropTypes.oneOf([0, 1, 2, 3, 4, 5, 6]),
    helpMessage: _react2.default.PropTypes.string,
    initialDate: _react2.default.PropTypes.instanceOf(Date),
    initialFromValue: _react2.default.PropTypes.bool,
    initialMonth: _react2.default.PropTypes.number, // Overrides values derived from initialDate/initialRange
    initialRange: _react2.default.PropTypes.object,
    initialYear: _react2.default.PropTypes.number, // Overrides values derived from initialDate/initialRange
    locale: _react2.default.PropTypes.string,
    maximumDate: _react2.default.PropTypes.instanceOf(Date),
    minimumDate: _react2.default.PropTypes.instanceOf(Date),
    numberOfCalendars: _react2.default.PropTypes.number,
    onHighlightDate: _react2.default.PropTypes.func, // triggered when a date is highlighted (hovered)
    onUnHighlightDate: _react2.default.PropTypes.func,
    onHighlightRange: _react2.default.PropTypes.func, // triggered when a range is highlighted (hovered)
    onSelect: _react2.default.PropTypes.func, // triggered when a date or range is selectec
    onSelectStart: _react2.default.PropTypes.func, // triggered when the first date in a range is selected
    paginationArrowComponent: _react2.default.PropTypes.func,
    selectedLabel: _react2.default.PropTypes.string,
    selectionType: _react2.default.PropTypes.oneOf(['single', 'range']),
    singleDateRange: _react2.default.PropTypes.bool,
    showLegend: _react2.default.PropTypes.bool,
    stateDefinitions: _react2.default.PropTypes.object,
    value: _CustomPropTypes2.default.momentOrMomentRange,
    renderYearInCalendarHeader: _react2.default.PropTypes.bool
  },

  getDefaultProps: function getDefaultProps() {
    var date = new Date();
    var initialDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    return {
      bemNamespace: null,
      bemBlock: 'DateRangePicker',
      className: '',
      numberOfCalendars: 1,
      firstOfWeek: 0,
      disableNavigation: false,
      nextLabel: '',
      previousLabel: '',
      initialDate: initialDate,
      initialFromValue: true,
      locale: (0, _moment2.default)().locale(),
      selectionType: 'range',
      singleDateRange: false,
      stateDefinitions: {
        '__default': {
          color: null,
          selectable: true,
          label: null
        }
      },
      selectedLabel: "Your selected dates",
      defaultState: '__default',
      dateStates: [],
      showLegend: false,
      onSelect: noop,
      paginationArrowComponent: _PaginationArrow2.default,
      renderYearInCalendarHeader: true
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextDateStates = this.getDateStates(nextProps);
    var nextEnabledRange = this.getEnabledRange(nextProps);

    var updatedState = {
      selectedStartDate: null,
      hideSelection: false,
      dateStates: this.state.dateStates && _immutable2.default.is(this.state.dateStates, nextDateStates) ? this.state.dateStates : nextDateStates,
      enabledRange: this.state.enabledRange && this.state.enabledRange.isSame(nextEnabledRange) ? this.state.enabledRange : nextEnabledRange
    };

    if ((0, _hasUpdatedValue2.default)(this.props, nextProps)) {
      var isNewValueVisible = this.isStartOrEndVisible(nextProps);

      if (!isNewValueVisible) {
        var yearMonth = (0, _getYearMonth.getYearMonthProps)(nextProps);

        updatedState.year = yearMonth.year;
        updatedState.month = yearMonth.month;
      }
    }

    this.setState(updatedState);
  },
  getInitialState: function getInitialState() {
    var now = new Date();
    var _props = this.props,
        initialYear = _props.initialYear,
        initialMonth = _props.initialMonth,
        initialFromValue = _props.initialFromValue,
        value = _props.value;

    var year = now.getFullYear();
    var month = now.getMonth();

    if (initialYear && initialMonth) {
      year = initialYear;
      month = initialMonth;
    }

    if (initialFromValue && value) {
      var yearMonth = (0, _getYearMonth.getYearMonthProps)(this.props);
      month = yearMonth.month;
      year = yearMonth.year;
    }

    return {
      year: year,
      month: month,
      selectedStartDate: null,
      highlightedDate: null,
      highlightRange: null,
      hideSelection: false,
      enabledRange: this.getEnabledRange(this.props),
      dateStates: this.getDateStates(this.props)
    };
  },
  getEnabledRange: function getEnabledRange(props) {
    var min = props.minimumDate ? (0, _moment2.default)(props.minimumDate).startOf('day') : absoluteMinimum;
    var max = props.maximumDate ? (0, _moment2.default)(props.maximumDate).startOf('day') : absoluteMaximum;

    return _moment2.default.range(min, max);
  },
  getDateStates: function getDateStates(props) {
    var dateStates = props.dateStates,
        stateDefinitions = props.stateDefinitions;

    var actualStates = [];

    var defs = stateDefinitions;

    dateStates.forEach(function (s) {
      var r = s.range;
      var start = r.start.startOf('day');
      var end = r.end.startOf('day');

      var def = defs[s.state];

      actualStates.push(Object.assign({}, s, {
        range: _moment2.default.range(start, end),
        selectable: def.selectable ? def.selectable : true,
        color: def.color,
        className: def.className
      }));
    });

    return actualStates;
  },
  isDateDisabled: function isDateDisabled(date) {
    return !this.state.enabledRange.contains(date);
  },
  isDateSelectable: function isDateSelectable(date) {
    return this.dateRangesForDate(date).some(function (r) {
      return r.selectable;
    });
  },
  nonSelectableStateRanges: function nonSelectableStateRanges() {
    return this.state.dateStates.filter(function (d) {
      return !d.selectable;
    });
  },
  dateRangesForDate: function dateRangesForDate(date) {
    var ss = this.state.dateStates;
    var res = false;
    for (var i = 0; i < ss.length; i += 3) {
      var d1 = ss[i];
      if (contains(d1.range, date)) {
        res = d1;
        break;
      }

      var d2 = ss[i + 1];
      if (d2 && contains(d2.range, date)) {
        res = d2;
        break;
      }

      var d3 = ss[i + 2];
      if (d3 && contains(d3.range, date)) {
        res = d3;
        break;
      }
    }
    if (!res) {
      var _props2 = this.props,
          defaultState = _props2.defaultState,
          stateDefinitions = _props2.stateDefinitions;

      var s = stateDefinitions[defaultState];
      var defs = stateDefinitions;
      var def = defs[defaultState];

      return [{
        range: s.range,
        state: defaultState,
        selectable: true,
        color: def.color,
        className: def.className
      }];
    }
    return [res];
  },
  sanitizeRange: function sanitizeRange(range, forwards) {
    /* Truncates the provided range at the first intersection
     * with a non-selectable state. Using forwards to determine
     * which direction to work
     */
    var blockedRanges = this.nonSelectableStateRanges().map(function (r) {
      return r.get('range');
    });
    var intersect = void 0;

    if (forwards) {
      intersect = blockedRanges.find(function (r) {
        return range.intersect(r);
      });
      if (intersect) {
        return _moment2.default.range(range.start, intersect.start);
      }
    } else {
      intersect = blockedRanges.findLast(function (r) {
        return range.intersect(r);
      });

      if (intersect) {
        return _moment2.default.range(intersect.end, range.end);
      }
    }

    if (range.start.isBefore(this.state.enabledRange.start)) {
      return _moment2.default.range(this.state.enabledRange.start, range.end);
    }

    if (range.end.isAfter(this.state.enabledRange.end)) {
      return _moment2.default.range(range.start, this.state.enabledRange.end);
    }

    return range;
  },
  highlightRange: function highlightRange(range) {
    this.setState({
      highlightedRange: range,
      highlightedDate: null
    });
    if (typeof this.props.onHighlightRange === 'function') {
      this.props.onHighlightRange(range, this.statesForRange(range));
    }
  },
  onUnHighlightDate: function onUnHighlightDate() {
    this.setState({
      highlightedDate: null
    });
    if (this.props.onUnHighlightDate) {
      this.props.onUnHighlightDate();
    }
  },
  onSelectDate: function onSelectDate(date) {
    var selectionType = this.props.selectionType;
    var selectedStartDate = this.state.selectedStartDate;


    if (selectionType === 'range') {
      if (selectedStartDate) {
        this.completeRangeSelection();
      } else if (!this.isDateDisabled(date) && this.isDateSelectable(date)) {
        this.startRangeSelection(date);
        if (this.props.singleDateRange) {
          this.highlightRange(_moment2.default.range(date, date));
        }
      }
    } else {
      if (!this.isDateDisabled(date) && this.isDateSelectable(date)) {
        this.completeSelection();
      }
    }
  },
  onHighlightDate: function onHighlightDate(date, e) {
    var selectionType = this.props.selectionType;
    var selectedStartDate = this.state.selectedStartDate;


    var datePair = void 0;
    var range = void 0;
    var forwards = void 0;

    if (selectionType === 'range') {
      if (selectedStartDate) {
        datePair = _immutable2.default.List.of(selectedStartDate, date).sortBy(function (d) {
          return d.unix();
        });
        range = _moment2.default.range(datePair.get(0), datePair.get(1));
        forwards = range.start.unix() === selectedStartDate.unix();
        range = this.sanitizeRange(range, forwards);
        this.highlightRange(range);
      } else if (!this.isDateDisabled(date) && this.isDateSelectable(date)) {
        this.highlightDate(date, e);
      }
    } else {
      if (!this.isDateDisabled(date) && this.isDateSelectable(date)) {
        this.highlightDate(date, e);
      }
    }
  },
  startRangeSelection: function startRangeSelection(date) {
    this.setState({
      hideSelection: true,
      selectedStartDate: date
    });
    if (typeof this.props.onSelectStart === 'function') {
      this.props.onSelectStart((0, _moment2.default)(date));
    }
  },
  statesForDate: function statesForDate(date) {
    return this.state.dateStates.filter(function (d) {
      return date.within(d.range);
    }).map(function (d) {
      return d.state;
    });
  },
  statesForRange: function statesForRange(range) {
    if (range.start.isSame(range.end, 'day')) {
      return this.statesForDate(range.start);
    }
    return this.state.dateStates.filter(function (d) {
      return d.range.intersect(range);
    }).map(function (d) {
      return d.state;
    });
  },
  completeSelection: function completeSelection() {
    var highlightedDate = this.state.highlightedDate;
    if (highlightedDate) {
      this.props.onSelect(highlightedDate, this.statesForDate(highlightedDate));
    }
  },
  completeRangeSelection: function completeRangeSelection() {
    var range = this.state.highlightedRange;

    if (range && (!range.start.isSame(range.end, 'day') || this.props.singleDateRange)) {
      this.setState({
        selectedStartDate: null,
        highlightedRange: null,
        highlightedDate: null,
        hideSelection: false
      });
      this.props.onSelect(range, this.statesForRange(range));
    }
  },
  highlightDate: function highlightDate(date, e) {
    this.setState({
      highlightedDate: date
    });
    if (typeof this.props.onHighlightDate === 'function') {
      this.props.onHighlightDate(date, this.statesForDate(date), e);
    }
  },
  getMonthDate: function getMonthDate() {
    return (0, _moment2.default)(new Date(this.state.year, this.state.month, 1));
  },
  isStartOrEndVisible: function isStartOrEndVisible(props) {
    var _this = this;

    var value = props.value,
        selectionType = props.selectionType,
        numberOfCalendars = props.numberOfCalendars;


    var isVisible = function isVisible(date) {
      var yearMonth = (0, _getYearMonth.getYearMonth)(date);
      var isSameYear = yearMonth.year === _this.state.year;
      var isMonthVisible = yearMonth.month === _this.state.month || numberOfCalendars === 2 && yearMonth.month - 1 === _this.state.month;

      return isSameYear && isMonthVisible;
    };

    if (selectionType === 'single') {
      return isVisible(value);
    }

    return isVisible(value.start) || isVisible(value.end);
  },
  canMoveBack: function canMoveBack() {
    if (this.getMonthDate().subtract(1, 'days').isBefore(this.state.enabledRange.start)) {
      return false;
    }
    return true;
  },
  moveBack: function moveBack() {
    var monthDate = void 0;

    if (this.canMoveBack()) {
      monthDate = this.getMonthDate();
      monthDate.subtract(1, 'months');
      this.setState((0, _getYearMonth.getYearMonth)(monthDate));
    }
  },
  canMoveForward: function canMoveForward() {
    if (this.getMonthDate().add(this.props.numberOfCalendars, 'months').isAfter(this.state.enabledRange.end)) {
      return false;
    }
    return true;
  },
  moveForward: function moveForward() {
    var monthDate = void 0;

    if (this.canMoveForward()) {
      monthDate = this.getMonthDate();
      monthDate.add(1, 'months');
      this.setState((0, _getYearMonth.getYearMonth)(monthDate));
    }
  },
  changeYear: function changeYear(year) {
    var _state = this.state,
        enabledRange = _state.enabledRange,
        month = _state.month;


    if ((0, _moment2.default)({ years: year, months: month, date: 1 }).unix() < enabledRange.start.unix()) {
      month = enabledRange.start.month();
    }

    if ((0, _moment2.default)({ years: year, months: month + 1, date: 1 }).unix() > enabledRange.end.unix()) {
      month = enabledRange.end.month();
    }

    this.setState({
      year: year,
      month: month
    });
  },
  changeMonth: function changeMonth(date) {
    this.setState({
      month: date
    });
  },
  renderCalendar: function renderCalendar(index) {
    var _props3 = this.props,
        bemBlock = _props3.bemBlock,
        bemNamespace = _props3.bemNamespace,
        firstOfWeek = _props3.firstOfWeek,
        numberOfCalendars = _props3.numberOfCalendars,
        selectionType = _props3.selectionType,
        value = _props3.value;
    var _state2 = this.state,
        dateStates = _state2.dateStates,
        enabledRange = _state2.enabledRange,
        hideSelection = _state2.hideSelection,
        highlightedDate = _state2.highlightedDate,
        highlightedRange = _state2.highlightedRange;

    var monthDate = this.getMonthDate();
    var year = monthDate.year();
    var month = monthDate.month();
    var key = index + '-' + year + '-' + month;
    var props = void 0;

    monthDate.add(index, 'months');

    var cal = new _calendar2.default.Calendar(firstOfWeek);
    var monthDates = _immutable2.default.fromJS(cal.monthDates(monthDate.year(), monthDate.month()));
    var monthStart = monthDates.first().first();
    var monthEnd = monthDates.last().last();
    var monthRange = _moment2.default.range(monthStart, monthEnd);

    if (_moment2.default.isMoment(value)) {
      if (!monthRange.contains(value)) {
        value = null;
      }
    } else if ((0, _isMomentRange2.default)(value)) {
      if (!monthRange.overlaps(value)) {
        value = null;
      }
    }

    if (!_moment2.default.isMoment(highlightedDate) || !monthRange.contains(highlightedDate)) {
      highlightedDate = null;
    }

    if (!(0, _isMomentRange2.default)(highlightedRange) || !monthRange.overlaps(highlightedRange)) {
      highlightedRange = null;
    }

    props = {
      bemBlock: bemBlock,
      bemNamespace: bemNamespace,
      dateStates: dateStates,
      enabledRange: enabledRange,
      firstOfWeek: firstOfWeek,
      hideSelection: hideSelection,
      highlightedDate: highlightedDate,
      highlightedRange: highlightedRange,
      index: index,
      key: key,
      selectionType: selectionType,
      value: value,
      maxIndex: numberOfCalendars - 1,
      firstOfMonth: monthDate,
      onMonthChange: this.changeMonth,
      onYearChange: this.changeYear,
      onSelectDate: this.onSelectDate,
      onHighlightDate: this.onHighlightDate,
      onUnHighlightDate: this.onUnHighlightDate,
      dateRangesForDate: this.dateRangesForDate,
      dateComponent: _CalendarDate2.default,
      locale: this.props.locale,
      disableNavigation: this.props.disableNavigation,
      renderYearInCalendarHeader: this.props.renderYearInCalendarHeader
    };

    return _react2.default.createElement(_CalendarMonth2.default, props);
  },


  render: function render() {
    var _props4 = this.props,
        PaginationArrowComponent = _props4.paginationArrowComponent,
        className = _props4.className,
        numberOfCalendars = _props4.numberOfCalendars,
        stateDefinitions = _props4.stateDefinitions,
        selectedLabel = _props4.selectedLabel,
        showLegend = _props4.showLegend,
        helpMessage = _props4.helpMessage;


    var calendars = _immutable2.default.Range(0, numberOfCalendars).map(this.renderCalendar);
    className = this.cx({ element: null }) + ' ' + className;

    return _react2.default.createElement(
      'div',
      { className: className.trim() },
      _react2.default.createElement(PaginationArrowComponent, { direction: 'previous', onTrigger: this.moveBack, disabled: !this.canMoveBack() }),
      calendars.toJS(),
      _react2.default.createElement(PaginationArrowComponent, { direction: 'next', onTrigger: this.moveForward, disabled: !this.canMoveForward() }),
      helpMessage ? _react2.default.createElement(
        'span',
        { className: this.cx({ element: 'HelpMessage' }) },
        helpMessage
      ) : null,
      showLegend ? _react2.default.createElement(_Legend2.default, { stateDefinitions: stateDefinitions, selectedLabel: selectedLabel }) : null
    );
  }
});

exports.default = DateRangePicker;
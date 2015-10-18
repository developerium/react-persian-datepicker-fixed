import React, { PropTypes } from 'react';
import Heading from './Heading.js';
import moment from 'moment-jalaali';
import Day from './Day.js';

// Load Persian localisation
moment.loadPersian();

// Day of week names for use in date-picker heading
const dayOfWeekNames = [
  'ش',
  'ی',
  'د',
  'س',
  'چ',
  'پ',
  'ج'
];

export default class Calendar extends React.Component {
  static propTypes = {
    startDayOfWeek: PropTypes.number,
    onSelect: PropTypes.func,
    month: PropTypes.object,
    max: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    min: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string
    ]),
    prevMonthElement: PropTypes.element,
    nextMonthElement: PropTypes.element,
    selectedDay: PropTypes.object,
    className: PropTypes.string
  };

  static defaultProps = {
    prevMonthElement: <i className="fa fa-arrow-left"></i>,
    nextMonthElement: <i className="fa fa-arrow-right"></i>
  };

  componentWillMount() {
    const state = {};
    const props = this.props;

    let month;

    if (props.selectedDay) {
      state.selectedDay = props.selectedDay;
      month = state.selectedDay.clone();
    } else {
      if (props.month) {
        month = props.month;
      } else {
        month = moment();
      }

      month.locale('fa');
    }

    state.month = month;

    this.state = state;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.selectedDay !== this.props.selectedDay) {
      nextState.selectedDay = nextProps.selectedDay;
    }

    if (this.state.selectedDay !== nextState.selectedDay) {
      nextState.month = nextState.selectedDay.clone();
    }
  }

  nextMonth() {
    const { month } = this.state;
    month.add(1, 'months');
    this.forceUpdate();
  }

  prevMonth() {
    const { month } = this.state;
    month.subtract(1, 'months');
    this.forceUpdate();
  }

  handleClick(day) {
    const state = this.state;
    const { onSelect } = this.props;

    this.setState({
      ...state,
      selectedDay: day
    });

    if (onSelect) {
      onSelect(day);
    }
  }

  render() {
    const { month, selectedDay } = this.state;
    const { prevMonthElement, nextMonthElement, min, max, className, ...rest } = this.props;
    const days = [];

    const current = month.clone().startOf('jMonth');
    const end = month.clone().endOf('jMonth');

    // Set start to the first day of week in the last month
    current.subtract((current.day() + 1) % 7, 'days');

    // Set end to the last day of week in the next month
    end.add(6 - (end.day() + 1) % 7, 'days');

    while (current.isBefore(end)) {
      days.push(current.clone());
      current.add(1, 'days');
    }

    return (<div className={(className ? className : '') + ' calendar'} {...rest}>
      <Heading month={month}
               onPrev={this.prevMonth.bind(this)}
               onNext={this.nextMonth.bind(this)}
               prevMonthElement={prevMonthElement}
               nextMonthElement={nextMonthElement}/>

      <div className="days-of-week">
        {
          dayOfWeekNames.map((name, key) => <div key={key}>{name}</div>)
        }
      </div>
      <div className="calendar-container">
        {
          days.map((day, key) => {
            const isCurrentMonth = day.format('jMM') === month.format('jMM');
            const isDisabled = (min ? day.isBefore(min) : false) || (max ? day.isAfter(max) : false);

            return (<Day
              key={key}
              selected={selectedDay ? selectedDay.isSame(day, 'day') : false}
              handleClick={this.handleClick.bind(this, day)}
              day={day}
              isDisabled={isDisabled}
              isCurrentMonth={isCurrentMonth}/>);
          })
        }
      </div>
    </div>);
  }
}

import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { reduxForm, Field, FieldArray, touch } from 'redux-form';
import IconPlus from '@/assets/images/icon/icon-plus.svg';
import IconTrash from '@/assets/images/icon/icon-trash.svg';
import RangeSlider from '@/components/RangeSlider/RangeSlider';
import AutoSuggestion from '@/components/AutoSuggestion/AutoSuggestion';
import moment from 'moment';
import DateTimePicker from '@/components/DateTimePicker/DateTimePicker';
import { renderField } from './form';
import { required, urlValidator } from './validate';
import { createEvent } from './action';
import ShareMarket from './ShareMarket';
import { createEventFormName } from './constants';

const minStep = 15;
const secStep = minStep * 60;

class CreateEventForm extends Component {
  static displayName = 'CreateEventForm';
  static propTypes = {
    className: PropTypes.string,
    reportList: PropTypes.array,
    categoryList: PropTypes.array,
    isNew: PropTypes.bool,
    initialValues: PropTypes.object,
    shareEvent: PropTypes.object,
    eventList: PropTypes.array,
    formAction: PropTypes.func,
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    className: '',
    reportList: undefined,
    categoryList: undefined,
    formAction: undefined,
    dispatch: undefined,
    isNew: true,
    initialValues: {},
    shareEvent: null,
    eventList: [],
  };

  constructor(props) {
    super(props);
    this.state = {
      closingTime: props.initialValues.closingTime,
      reportingTime: props.initialValues.reportingTime,
      disputeTime: props.initialValues.disputeTime,
      selectedReportSource: undefined,
    };
  }

  onCreateNewEvent = (values, dispatch, props) => {
    dispatch(createEvent({
      values,
      isNew: props.isNew,
      selectedSource: this.state.selectedReportSource,
    }));
  }

  setFieldValueToState = (fieldName, value) => {
    this.setState({
      [fieldName]: value,
    });
  }

  addMoreOutcomes = (fields) => {
    const allData = fields.getAll();
    const lastIndex = allData.length - 1;
    const newItem = allData[lastIndex];
    const isValid = !!(newItem.name && newItem.name.trim());
    if (isValid) {
      fields.push({});
    } else {
      const { dispatch, formAction } = this.props;
      // this.props.dispatch(touch('CreateEventForm', 'outcomes[0].name', ''));
      dispatch(formAction(touch, `outcomes[${lastIndex}].name`));
    }
  }

  unixToDateFormat = (value) => {
    if (!value) return value;
    return moment.unix(value).format('DD MMMM YYYY HH:mm');
  }

  buildPicker = ({ inputProps, value }) => {
    return (
      <div className="rmc-picker-date-time">
        <input
          className="form-control"
          {...inputProps}
          value={this.unixToDateFormat(value)}
        />
      </div>
    );
  }

  smallerThanReportingTime = (value) => {
    const { reportingTime } = this.state;
    if (!reportingTime || !this.props.isNew) return null;
    const isValid = moment.unix(value + secStep).isSameOrBefore(moment.unix(reportingTime), 'minute');
    return isValid ? null : `Closing time must be before Reporting Time at least ${minStep}min`;
  }

  smallerThanDisputeTime = (value) => {
    const { disputeTime } = this.state;
    if (!disputeTime || !this.props.isNew) return null;
    const isValid = moment.unix(value + secStep).isSameOrBefore(moment.unix(disputeTime), 'minute');
    return isValid ? null : `Reporting time must be before Dispute Time at least ${minStep}min`;
  }

  validateOutcomes = (value) => {
    const lastIndex = value.length - 1;
    const newItem = value[lastIndex];
    const oldData = value.slice(0, lastIndex);
    return oldData.every((i) => i.name !== newItem.name) ? undefined : 'Outcome already exists';
  }

  renderGroupTitle = (title) => {
    return (<div className="CreateEventFormGroupTitle">{title}</div>);
  }

  renderGroupNote = (text) => {
    return (<div className="CreateEventFormGroupNote">{text}</div>);
  }

  renderEventSuggest = (props) => {
    const title = 'EVENT';
    return (
      <React.Fragment>
        {this.renderGroupTitle(title)}
        <Field
          name="eventName"
          className="form-group"
          fieldClass="form-control"
          onSelectEvent={props.onSelectEvent}
          source={props.eventList}
          validate={required}
          component={this.renderAutoSuggestion}
        />
      </React.Fragment>
    );
  };

  renderCategories = (props) => {
    return (
      <Field
        name="category"
        type="select"
        label="Category"
        disabled={!props.isNew}
        validate={required}
        component={renderField}
      >
        <option value="">Please select a category</option>
        {props.categoryList.map(r => <option value={r.id} key={r.id}>{r.name}</option>)}
      </Field>
    );
  }

  renderAutoSuggestion = (props) => {
    return (
      <AutoSuggestion
        {...props}
        name="eventName"
        placeholder="Choose an Event or Create a new one"
        value={props.input.value}
        onChange={props.input.onChange}
      />
    );
  };

  renderOutComes = (props) => {
    const { fields, meta: { error }, isNew } = props;
    const allData = fields.getAll();
    const lastIndex = allData.length - 1;
    return (
      <React.Fragment>
        { this.renderGroupTitle('OUTCOME') }
        {
          fields.map((outcome, index) => {
            const { id } = fields.get(index);
            const isLastIndex = index === lastIndex;
            const errCls = (error && isLastIndex) ? 'form-error' : '';
            return (
              <div className={`form-group-custom ${errCls}`} key={`${outcome}.id`}>
                <Field
                  name={`${outcome}.name`}
                  type="text"
                  className="form-group"
                  fieldClass="form-control"
                  component={renderField}
                  validate={[required]}
                  disabled={!isNew && id}
                />
                {!id && !!index &&
                <button
                  type="button"
                  className="trash"
                  onClick={() => fields.remove(index)}
                >
                  <img src={IconTrash} alt="" />
                </button>}
                {isLastIndex && error && <span className="ErrorMsg">{error}</span>}
              </div>
            );
          })
        }
        <button
          className="AddMoreOutCome"
          type="button"
          disabled={error}
          onClick={() => this.addMoreOutcomes(fields)}
        >
          <img src={IconPlus} alt="" className="IconPlus" />
          <span>Add more outcomes</span>
        </button>
      </React.Fragment>
    );
  }

  renderFee = ({ isNew }) => {
    const title = 'MARKET FEE';
    const textNote = 'The market fee is a percentage of the total winnings of the market.';
    const optionSlider = {
      min: 0,
      max: 99,
      tooltip: false,
      orientation: 'horizontal',
    };
    return (
      <div className="CreateEventFormBlock">
        {this.renderGroupTitle(title)}
        <Field
          name="creatorFee"
          type="number"
          unit="%"
          className="input-value"
          disabled={!isNew}
          options={optionSlider}
          component={this.renderRangleSlider}
        />
        {this.renderGroupNote(textNote)}
      </div>
    );
  }

  renderRangleSlider = (props) => {
    return (
      <RangeSlider
        {...props}
        value={props.input.value}
        onChange={props.input.onChange}
      />
    );
  }

  renderReport = (props, state) => {
    const title = 'REPORT';
    return (
      <React.Fragment>
        {this.renderGroupTitle(title)}
        <div className="form-group">
          <Field
            name="reports"
            component="select"
            className="form-control custom-select"
            disabled={!props.isNew}
            onChange={(e, newValue) => this.setFieldValueToState('selectedReportSource', newValue)}
          >
            <option value="">Please select a verified source</option>
            {props.reportList.map(r => <option value={r.id} key={r.id}>{`${r.name} - ${r.url}`}</option>)}
          </Field>
        </div>
        {
          props.isNew && !state.selectedReportSource &&
          <React.Fragment>
            <div className="CreateEventOption"><span>Or</span></div>
            <Field
              name="ownReportName"
              type="text"
              className="form-group"
              fieldClass="form-control"
              component={renderField}
              placeholder="Enter your prefer source name"
              validate={[required]}
            />
            <Field
              name="ownReportUrl"
              type="text"
              className="form-group"
              fieldClass="form-control"
              component={renderField}
              placeholder="Enter your prefer source URL"
              validate={[required, urlValidator]}
            />
            {this.renderGroupNote('We will review your source and get back to you within 24 hours.')}
          </React.Fragment>
        }
      </React.Fragment>
    );
  }

  renderDateTime = ({ input, disabled, type, title, placeholder, startDate, endDate, meta }) => {
    const { value, name, ...onEvents } = input;
    const { touched, dirty, error, warning } = meta;
    const inputProps = {
      name,
      type,
      placeholder,
      disabled,
    };
    const cls = classNames('form-group', {
      'form-error': (touched || dirty) && error,
      'form-warning': (touched || dirty) && warning,
    });
    return (
      <div className={cls}>
        <DateTimePicker
          onDateChange={(date) => this.setFieldValueToState(name, date)}
          value={value}
          title={title}
          inputProps={inputProps}
          {...onEvents}
          startDate={startDate}
          endDate={endDate}
          popupTriggerRenderer={this.buildPicker}
        />
        {(touched || dirty) && ((error && <span className="ErrorMsg">{error}</span>) || (warning && <span className="WarningMsg">{warning}</span>))}
      </div>
    );
  }

  renderTimeGroup = (props, state) => {
    const closingStartTime = moment().add(minStep, 'm').unix();
    return (
      <React.Fragment>
        <Field
          name="closingTime"
          type="text"
          component={this.renderDateTime}
          placeholder="Closing Time"
          title="Closing Time"
          validate={[required, this.smallerThanReportingTime]}
          disabled={!props.isNew}
          value={state.closingTime}
          startDate={closingStartTime}
          // endDate={state.reportingTime - secStep}
        />
        <Field
          name="reportingTime"
          type="text"
          component={this.renderDateTime}
          placeholder="Reporting Time"
          title="Reporting Time"
          validate={[required, this.smallerThanDisputeTime]}
          disabled={!props.isNew || !state.closingTime}
          value={state.reportingTime}
          startDate={state.closingTime + secStep}
          // endDate={state.disputeTime - secStep}
        />
        <Field
          name="disputeTime"
          type="text"
          component={this.renderDateTime}
          placeholder="Dispute Time"
          title="Dispute Time"
          validate={[required]}
          disabled={!props.isNew || !state.reportingTime}
          value={state.disputeTime}
          startDate={state.reportingTime + secStep}
        />
      </React.Fragment>
    );
  }

  renderComponent = (props, state) => {
    const cls = classNames(CreateEventForm.displayName, {
      [props.className]: !!props.className,
    });
    const { isNew, shareEvent } = props;
    if (shareEvent) {
      return (<ShareMarket shareEvent={shareEvent} isNew={isNew} />);
    }
    return (
      <form className={cls} onSubmit={props.handleSubmit(this.onCreateNewEvent)}>
        <div className="CreateEventFormBlock">
          {this.renderEventSuggest(props, state)}
          {this.renderCategories(props, state)}
          <FieldArray
            name="outcomes"
            isNew={props.isNew}
            validate={this.validateOutcomes}
            component={this.renderOutComes}
          />
        </div>
        {this.renderFee(props)}
        <div className="CreateEventFormBlock">
          {this.renderReport(props, state)}
          {this.renderTimeGroup(props, state)}
          <button type="submit" className="btn btn-primary btn-block" disabled={props.pristine || props.submitting}>
            {props.isNew ? 'Create a new event' : 'Add new outcomes'}
          </button>
        </div>
      </form>
    );
  };

  render() {
    return this.renderComponent(this.props, this.state);
  }
}

export default reduxForm({
  form: createEventFormName,
  enableReinitialize: true,
})(CreateEventForm);

import * as React from "react";
import { inject, observer } from "mobx-react";
import { RootStore, ILastDates } from "../stores/rootStore";
import {
  ILogEntry,
  IFormProps,
  defaultFormValues,
  dateFormat,
  convertLogEntryToFormValues,
  convertFormValuesToLogEntry,
  IEntryFormValues,
  entryFormFields,
  EntryFormFieldsConfigs,
  EntryFormFieldsEnum,
  BooleanMetric,
  booleanMetricKeys
} from "./";
import {
  message,
  Form,
  DatePicker,
  Radio,
  Input,
  Button,
  Card,
  Row,
  Col
} from "antd";
import moment, { Moment } from "moment";
import TextArea from "antd/lib/input/TextArea";
import TagsInput from "react-tagsinput";
import { FormInstance, Rule } from "antd/lib/form";
import { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { observable, action, toJS } from "mobx";

import "react-tagsinput/react-tagsinput.css";
import { remove, flatten } from "lodash";

interface IProps {
  rootStore?: RootStore;
}

@inject("rootStore")
@observer
export class EntryPage extends React.Component<IProps> {
  private formRef: React.RefObject<FormInstance> = React.createRef();

  @observable
  private dates?: ILastDates;

  @observable
  private nextDate: Moment = moment();

  @observable
  private selectedBooleanMetrics: string[] = [];

  @observable
  private formValues: IEntryFormValues = defaultFormValues;

  public constructor(props: IProps) {
    super(props);
  }

  public async componentWillMount() {
    if (this.props.rootStore) {
      const dates = await this.props.rootStore.fetchLastDates();
      this.dates = dates;

      this.setNextDate(
        moment(dates.last)
          .utc()
          .add(-moment().utcOffset(), "m")
          .add(1, "day")
      );

      this.setFormValues();
    }
  }

  @action
  private setNextDate = (date: Moment) => {
    this.nextDate = date;
  };

  @action
  private setFormValues = () => {
    // const formValues = convertLogEntryToFormValues(this.logEntry);
    const formValues = defaultFormValues;
    formValues.DATE = this.nextDate;
    this.formRef.current?.setFieldsValue(formValues);
  };

  private handleFinish = async (value: any) => {
    const values = value as IEntryFormValues;
    const entry: ILogEntry = convertFormValuesToLogEntry(values);
    const { rootStore } = this.props;

    if (!rootStore) {
      console.log("Rootstore not defined");
      return;
    }

    try {
      await rootStore.saveEntry(entry);
      message.success(`Saved data for ${entry.dateState?.date}`);
      this.formRef.current?.resetFields();

      this.setNextDate(this.nextDate.add(1, "day"));
      console.log("next", this.nextDate);
      this.setFormValues();
    } catch (error) {
      message.error(`Error saving data for ${entry.dateState?.date}`);
      console.error(error);
    }
  };

  private handleFinishFail = (error: ValidateErrorEntity) => {
    console.error(error);
  };

  private get booleanMetricRadioElements() {
    return Array.from(booleanMetricKeys).map(
      (entry: BooleanMetric | string) => {
        return (
          <Radio.Button
            value={entry}
            checked={this.selectedBooleanMetrics.includes(entry)}
            onClick={this.handleBooleanMetricChange}
          >
            {entry}
          </Radio.Button>
        );
      }
    );
  }

  @action
  private handleBooleanMetricChange = (event: any) => {
    const { value } = event.target;

    if (booleanMetricKeys.has(value)) {
      if (this.selectedBooleanMetrics.includes(value)) {
        remove(this.selectedBooleanMetrics, v => v === value);
      } else {
        this.selectedBooleanMetrics.push(value);
      }

      this.formRef.current?.setFieldsValue({
        [EntryFormFieldsEnum.SET_EMOTIONS]: this.selectedBooleanMetrics
      });
    }
  };

  private handleDateChange = (value: Moment | null, dateString: string) => {
    this.formRef.current?.setFieldsValue({
      [EntryFormFieldsEnum.DATE]: value
    });
  };

  private handleTagChange = (value: string[]) => {
    const emotions = flatten(
      value.map((v: string) => {
        return v.split(" ").filter(x => x.length > 0);
      })
    );

    console.log(emotions);
    this.formRef.current?.setFieldsValue({
      [EntryFormFieldsEnum.FREE_EMOTIONS]: emotions
    });
    console.log(this.formRef.current?.getFieldsValue());
  };

  private handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const cryAndThenKeto = event.target?.value;
    this.formRef.current?.setFieldsValue({
      [EntryFormFieldsEnum.WEIGHT]: cryAndThenKeto
    });
  };

  private handleThoughtsChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const text = event.target?.value;
    this.formRef.current?.setFieldsValue({
      [EntryFormFieldsEnum.THOUGHTS]: text
    });
  };

  private disableDatesAfterLastEntry = (current: Moment) => {
    return current && current > moment(this.dates?.last).endOf("day");
  };

  private getFormField = (field: EntryFormFieldsEnum) => {
    const config: IFormProps = EntryFormFieldsConfigs[field];
    let component = <Input></Input>;

    switch (field) {
      case EntryFormFieldsEnum.DATE:
        component = (
          <DatePicker
            disabledDate={this.disableDatesAfterLastEntry}
            onChange={this.handleDateChange}
          />
        );
        break;
      case EntryFormFieldsEnum.SET_EMOTIONS:
        component = (
          <Row gutter={8}>
            {this.booleanMetricRadioElements.map((radio, index) => (
              <Col key={index}>
                <Form.Item noStyle>{radio}</Form.Item>
              </Col>
            ))}
          </Row>
        );
        break;
      case EntryFormFieldsEnum.FREE_EMOTIONS:
        component = (
          <TagsInput
            value={[]}
            inputProps={{ placeholder: "Add another emotion..." }}
            onChange={this.handleTagChange}
          />
        );
        break;
      case EntryFormFieldsEnum.WEIGHT:
        component = <Input onChange={this.handleWeightChange} />;
        break;
      case EntryFormFieldsEnum.THOUGHTS:
        component = <TextArea onChange={this.handleThoughtsChange} rows={6} />;
        break;
    }

    const rules: Rule[] = [];

    if (config.required) {
      rules.push({
        required: true,
        message: "Mandatory field"
      });
    }

    if (config.validator) {
      rules.push({
        validator: config.validator
      });
    }

    return (
      <Form.Item
        key={config.id}
        name={config.name}
        label={config.label}
        rules={rules}
      >
        {component}
      </Form.Item>
    );
  };

  private getFormFields = (fields: EntryFormFieldsEnum[]) => {
    return fields.map(this.getFormField);
  };

  public render() {
    return (
      <div style={{ margin: "20px" }}>
        <Card
          loading={this.props.rootStore?.isFetchingDates}
          style={{ backgroundColor: "#c2c2c2" }}
        >
          <Form
            ref={this.formRef}
            labelCol={{ span: 3 }}
            labelAlign="right"
            wrapperCol={{ offset: 1, span: 20 }}
            onFinish={this.handleFinish}
            onFinishFailed={this.handleFinishFail}
            initialValues={this.formValues}
          >
            {this.getFormFields(entryFormFields)}
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Submit
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    );
  }
}

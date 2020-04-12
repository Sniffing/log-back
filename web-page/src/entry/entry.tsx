import * as React from "react";
import { inject, observer } from "mobx-react";
import { RootStore, ILastDates } from "../stores/rootStore";
import { ILogEntry, IFormProps } from "./";
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
import {
  entryFormFields,
  EntryFormFieldsConfigs,
  EntryFormFieldsEnum
} from "./entry-form-fields";
import { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { observable, action } from "mobx";
import { IEntryFormValues } from "./entry.interfaces";

interface IProps {
  rootStore?: RootStore;
}

const dateFormat = "YYYY/MM/DD";
const booleanEntries: string[] = [
  "happy",
  "sad",
  "sick",
  "lonely",
  "stress",
  "overate",
  "dance",
  "gym"
];

const defaultFormValues: IEntryFormValues = {
  [EntryFormFieldsEnum.DATE]: moment(),
  [EntryFormFieldsEnum.SET_EMOTIONS]: [],
  [EntryFormFieldsEnum.FREE_EMOTIONS]: []
};

@inject("rootStore")
@observer
export class EntryPage extends React.Component<IProps> {
  private formRef: React.RefObject<FormInstance> = React.createRef();

  @observable
  private logEntry?: ILogEntry;

  @observable
  private dates?: ILastDates;

  @observable
  private formValues: IEntryFormValues = defaultFormValues;

  public constructor(props: IProps) {
    super(props);
  }

  public async componentWillMount() {
    if (this.props.rootStore) {
      const dates = await this.props.rootStore.fetchLastDates();
      this.dates = dates;
      this.setLogEntry(this.makeEntry(moment(dates.last).toDate()));
      this.setFormValues();
    }
  }

  @action
  private setLogEntry = (entry: ILogEntry) => {
    this.logEntry = entry;
  };

  private makeEntry = (date: Date = new Date()) => {
    return {
      dateState: {
        date
      },
      keywordsState: {
        keywords: []
      },
      textState: {
        data: ""
      }
    };
  };

  @action
  private setFormValues = () => {
    const formValues = this.convertLogEntryToFormValues();
    this.formRef.current?.setFieldsValue(formValues);
  };

  private convertLogEntryToFormValues = (): IEntryFormValues => {
    if (!this.logEntry) return defaultFormValues;

    return {
      [EntryFormFieldsEnum.DATE]: moment(this.logEntry.dateState.date),
      [EntryFormFieldsEnum.SET_EMOTIONS]: this.logEntry.booleanMetricState
        ? Object.keys(this.logEntry.booleanMetricState)
        : [],
      [EntryFormFieldsEnum.FREE_EMOTIONS]: this.logEntry.keywordsState.keywords,
      [EntryFormFieldsEnum.WEIGHT]: this.logEntry.entryMetricState,
      [EntryFormFieldsEnum.THOUGHTS]: this.logEntry.textState.data
    };
  };

  private handleFinish = async (value: any) => {
    const entry = value as ILogEntry;
    const { rootStore } = this.props;

    if (!rootStore) {
      console.log("Rootstore not defined");
      return;
    }

    try {
      await rootStore.saveEntry(entry);
      message.success(`Saved data for ${entry.dateState?.date.toDateString()}`);
    } catch (error) {
      message.error(
        `Error saving data for ${entry.dateState?.date.toDateString()}`
      );
      console.error(error);
    }
  };

  private handleFinishFail = (error: ValidateErrorEntity) => {
    console.error(error);
  };

  private get booleanMetricRadioElements() {
    return booleanEntries.map((entry: string) => {
      return <Radio.Button>{entry}</Radio.Button>;
    });
  }

  private handleDateChange = (value: Moment | null, dateString: string) => {
    console.log("date changed", value, dateString);
    // this.formRef.current?.setFieldsValue({
    //   [EntryFormFieldsEnum.DATE]: value
    // });
  };

  private getFormField = (field: EntryFormFieldsEnum) => {
    const config: IFormProps = EntryFormFieldsConfigs[field];
    let component = <Input></Input>;

    switch (field) {
      case EntryFormFieldsEnum.DATE:
        component = <DatePicker onChange={this.handleDateChange} />;
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
            onChange={() => {}}
          />
        );
        break;
      case EntryFormFieldsEnum.WEIGHT:
        component = <Input />;
        break;
      case EntryFormFieldsEnum.THOUGHTS:
        component = <TextArea rows={6} />;
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

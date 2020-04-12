import * as React from "react";
import { inject } from "mobx-react";
import { RootStore } from "../stores/rootStore";
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
import moment from "moment";
import TextArea from "antd/lib/input/TextArea";
import TagsInput from "react-tagsinput";
import { FormInstance, FormItemProps, Rule } from "antd/lib/form";
import {
  entryFormFields,
  EntryFormFieldsEnum,
  EntryFormFieldsConfigs
} from "./entry-form-fields";
import { ValidateErrorEntity } from "rc-field-form/lib/interface";
import { observable, action } from "mobx";

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

@inject("rootStore")
export class EntryPage extends React.Component<IProps> {
  private formRef: React.RefObject<FormInstance> = React.createRef();

  @observable
  private logEntry?: ILogEntry;

  public constructor(props: IProps) {
    super(props);

    this.initialiseEntry(new Date());
  }

  public async componentWillMount() {
    if (this.props.rootStore) {
      const dates = await this.props.rootStore.fetchLastDates();
      console.log("fetched dates", dates);
    }
  }

  @action
  private initialiseEntry = (date: Date) => {
    this.logEntry = {
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

  private handleFinish = async (value: any) => {
    const entry = value as ILogEntry;
    const { rootStore } = this.props;

    if (!rootStore) {
      console.log("Rootstore not defined");
      return;
    }

    try {
      await rootStore.saveEntry(entry);
      // message.success(`Saved data for ${entry.dateState.date.toDateString()}`);
    } catch (error) {
      // message.error(
      //   `Error saving data for ${entry.dateState.date.toDateString()}`
      // );
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

  private getFormField = (field: EntryFormFieldsEnum) => {
    const config: IFormProps = EntryFormFieldsConfigs[field];
    let component = <Input></Input>;

    switch (field) {
      case EntryFormFieldsEnum.DATE:
        component = <DatePicker defaultValue={moment()} />;
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
        component = <TagsInput value={[]} onChange={() => {}}></TagsInput>;
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
        message: "Must enter date"
      });
    }

    if (config.validator) {
      rules.push({
        validator: config.validator
      });
    }

    return (
      <Form.Item key={config.id} label={config.label} rules={rules}>
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
        <Card style={{ backgroundColor: "#d8d8d8" }}>
          <Form
            ref={this.formRef}
            labelCol={{ span: 3 }}
            labelAlign="right"
            wrapperCol={{ offset: 1, span: 20 }}
            onFinish={this.handleFinish}
            onFinishFailed={this.handleFinishFail}
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

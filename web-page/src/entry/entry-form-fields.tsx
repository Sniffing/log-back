import * as React from "react";
import { IFormProps } from ".";

export enum EntryFormFieldsEnum {
  DATE = "DATE",
  SET_EMOTIONS = "SET_EMOTIONS",
  FREE_EMOTIONS = "FREE_EMOTIONS",
  WEIGHT = "WEIGHT",
  THOUGHTS = "THOUGHTS"
}

export const entryFormFields = Object.values(EntryFormFieldsEnum);

const generateFormLabel = (label: string) => (
  <span style={{ textTransform: "capitalize" }}>{label.toLowerCase()}</span>
);

const getBaseConfig = (field: EntryFormFieldsEnum): IFormProps => {
  return {
    id: field,
    name: field,
    label: generateFormLabel(field)
  };
};

export const EntryFormFieldsConfigs: Record<EntryFormFieldsEnum, IFormProps> = {
  [EntryFormFieldsEnum.DATE]: {
    ...getBaseConfig(EntryFormFieldsEnum.DATE),
    required: true
  },
  [EntryFormFieldsEnum.SET_EMOTIONS]: {
    ...getBaseConfig(EntryFormFieldsEnum.SET_EMOTIONS),
    label: "Emotions"
  },
  [EntryFormFieldsEnum.FREE_EMOTIONS]: {
    ...getBaseConfig(EntryFormFieldsEnum.FREE_EMOTIONS),
    label: "Other emotions"
  },
  [EntryFormFieldsEnum.WEIGHT]: {
    ...getBaseConfig(EntryFormFieldsEnum.WEIGHT)
  },
  [EntryFormFieldsEnum.THOUGHTS]: {
    ...getBaseConfig(EntryFormFieldsEnum.THOUGHTS),
    required: true
  }
};

import mongoose, { Schema, Document } from "mongoose";

export interface IAnswer {
  fieldId: string;
  value: any;
}

export interface IFormResponse extends Document {
  formId: string;
  formVersion: number;
  submittedBy: string;
  submittedAt: Date;
  status: "draft" | "submitted" | "archived";
  answers: IAnswer[];
}

const AnswerSchema = new Schema<IAnswer>(
  {
    fieldId: { type: String, required: true },
    value: { type: Schema.Types.Mixed, required: false },
  },
  { _id: false }
);

const FormResponseSchema = new Schema<IFormResponse>(
  {
    formId: { type: String, required: true },
    formVersion: { type: Number, required: true },
    submittedBy: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["draft", "submitted", "archived"],
      default: "submitted",
    },
    answers: [AnswerSchema],
  },
  { timestamps: true }
);

// Index for fast lookup by formId
FormResponseSchema.index({ formId: 1 });
FormResponseSchema.index({ formId: 1, formVersion: 1 });

export default mongoose.model<IFormResponse>("FormResponse", FormResponseSchema);
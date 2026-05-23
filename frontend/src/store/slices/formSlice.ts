import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FormSchema, Field } from '../../types/form.types';

interface FormState {
  schemas: FormSchema[];
  currentSchema: FormSchema | null;
  selectedFieldId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: FormState = {
  schemas: [],
  currentSchema: null,
  selectedFieldId: null,
  loading: false,
  error: null,
};

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setSchemas: (state, action: PayloadAction<FormSchema[]>) => {
      state.schemas = action.payload;
    },
    setCurrentSchema: (state, action: PayloadAction<FormSchema | null>) => {
      state.currentSchema = action.payload;
      state.selectedFieldId = null;
    },
    setSelectedFieldId: (state, action: PayloadAction<string | null>) => {
      state.selectedFieldId = action.payload;
    },
    addField: (state, action: PayloadAction<Field>) => {
      if (state.currentSchema) {
        state.currentSchema.fields.push(action.payload);
      }
    },
    updateField: (state, action: PayloadAction<{ fieldId: string; updates: Partial<Field> }>) => {
      if (state.currentSchema) {
        const fieldIndex = state.currentSchema.fields.findIndex(f => f.fieldId === action.payload.fieldId);
        if (fieldIndex !== -1) {
          state.currentSchema.fields[fieldIndex] = {
            ...state.currentSchema.fields[fieldIndex],
            ...action.payload.updates,
          };
        }
      }
    },
    deleteField: (state, action: PayloadAction<string>) => {
      if (state.currentSchema) {
        state.currentSchema.fields = state.currentSchema.fields.filter(f => f.fieldId !== action.payload);
        if (state.selectedFieldId === action.payload) {
          state.selectedFieldId = null;
        }
      }
    },
    updateSchemaMeta: (state, action: PayloadAction<any>) => {
      if (state.currentSchema) {
        state.currentSchema.meta = { ...state.currentSchema.meta, ...action.payload };
      }
    }
  },
});

export const { 
  setSchemas, 
  setCurrentSchema, 
  setSelectedFieldId, 
  addField, 
  updateField, 
  deleteField,
  updateSchemaMeta
} = formSlice.actions;

export default formSlice.reducer;

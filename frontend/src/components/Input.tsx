import React from 'react';
import { Input } from './ui/Fields';

interface LegacyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/** Backwards-compatible Input used across existing pages. */
const InputLegacy: React.FC<LegacyInputProps> = (props) => <Input {...props} />;

export default InputLegacy;

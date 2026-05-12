/**
 * DateField
 *
 * Wraps InputField with a date input. Placeholder always shows the
 * canonical DD/MM/YYYY format from project standards.
 */

import { FORMATS } from '../../config/projectStandards.js';
import InputField from './InputField.jsx';

export default function DateField(props) {
  return (
    <InputField
      field="date"
      type="date"
      placeholder={props.placeholder ?? FORMATS.date}
      {...props}
    />
  );
}

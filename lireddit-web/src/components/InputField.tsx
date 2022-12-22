import { FormControl, FormLabel, Input, FormErrorMessage, Textarea } from "@chakra-ui/react";
import { FieldHookConfig, useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
};

export const InputField: React.FC<InputFieldProps> = ({ label, textarea, ...props }) => {
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      {textarea ? (
        <Textarea size='lg' {...field} placeholder={props.placeholder} />
      ) : (
        <Input {...props} size='lg' {...field} id={field.name} placeholder={props.placeholder} />
      )}

      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
};

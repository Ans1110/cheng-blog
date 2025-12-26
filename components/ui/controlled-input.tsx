"use client";

import { cn } from "@/lib/utils";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { Label } from "./label";
import { Input } from "./input";

type ControlledInputProps<T extends FieldValues> = {
  name: Path<T>;
  label?: React.ReactNode;
  containerClassName?: string;
} & React.ComponentProps<"input">;

const ControlledInput = <T extends FieldValues>({
  className,
  type,
  name,
  label,
  containerClassName,
  onChange,
  ...props
}: ControlledInputProps<T>) => {
  const { control } = useFormContext<T>();
  return (
    <div className={cn("w-full", containerClassName)}>
      {!!label && (
        <Label className="mb-2" htmlFor={name}>
          {label}
        </Label>
      )}
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => {
          // For file inputs, don't spread the value prop
          const { value, onChange: fieldOnChange, ...fieldProps } = field;

          return (
            <>
              <Input
                type={type}
                id={name}
                data-slot="input"
                aria-invalid={!!error}
                className={className}
                {...(type === "file" ? fieldProps : field)}
                onChange={(e) => {
                  // Call both the field onChange and custom onChange
                  if (type === "file") {
                    const file = e.target.files?.[0];
                    if (file) {
                      // For file inputs, store the file URL or name
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        fieldOnChange(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  } else {
                    fieldOnChange(e);
                  }
                  // Call custom onChange if provided
                  onChange?.(e);
                }}
                {...props}
              />
              {!!error && (
                <p className="text-destructive text-sm">{error.message}</p>
              )}
            </>
          );
        }}
      />
    </div>
  );
};

export { ControlledInput };

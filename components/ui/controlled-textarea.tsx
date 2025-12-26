"use client";

import { cn } from "@/lib/utils";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { Label } from "./label";
import { Textarea } from "./textarea";

type ControlledTextareaProps<T extends FieldValues> = {
  name: Path<T>;
  label?: React.ReactNode;
  containerClassName?: string;
} & React.ComponentProps<"textarea">;

const ControlledTextarea = <T extends FieldValues>({
  className,
  name,
  label,
  containerClassName,
  onChange,
  ...props
}: ControlledTextareaProps<T>) => {
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
          return (
            <>
              <Textarea
                id={name}
                data-slot="textarea"
                aria-invalid={!!error}
                className={className}
                {...field}
                onChange={(e) => {
                  field.onChange(e);
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

export { ControlledTextarea };

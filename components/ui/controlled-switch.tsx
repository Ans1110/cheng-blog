"use client";

import { cn } from "@/lib/utils";
import { Controller, FieldValues, Path, useFormContext } from "react-hook-form";
import { Label } from "./label";
import { Switch } from "./switch";

type ControlledSwitchProps<T extends FieldValues> = {
  name: Path<T> | (string & {});
  label?: React.ReactNode;
  containerClassName?: string;
} & Omit<React.ComponentProps<typeof Switch>, "checked" | "onCheckedChange">;

const ControlledSwitch = <T extends FieldValues>({
  className,
  name,
  label,
  containerClassName,
  ...props
}: ControlledSwitchProps<T>) => {
  const { control } = useFormContext<T>();
  return (
    <div className={cn("flex items-center gap-2", containerClassName)}>
      <Controller
        name={name as Path<T>}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <>
            <Switch
              id={name}
              data-slot="switch"
              aria-invalid={!!error}
              className={className}
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              {...props}
            />
            {!!label && (
              <Label htmlFor={name}>{label}</Label>
            )}
            {!!error && (
              <p className="text-destructive text-sm">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export { ControlledSwitch };

"use client";
import { ButtonProps, Button } from "./Button";
/** Compatibility wrapper for existing primary actions. */
export default function GradientButton(props: ButtonProps) {
  return <Button type="submit" {...props} />;
}

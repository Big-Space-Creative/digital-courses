"use client";

import Link from "next/link";
import { ComponentPropsWithRef } from "react";
import { buttonClassName, ButtonStyleProps } from "./Button";

export type ButtonLinkProps = ComponentPropsWithRef<typeof Link> &
  ButtonStyleProps;

/** Navigation is a single anchor, with the same appearance as Button. */
export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={buttonClassName({ variant, size, className })}
    />
  );
}

export default ButtonLink;

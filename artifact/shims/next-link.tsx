/** Stand-in for `next/link` in the artifact build. */
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { navigate, splitHref, tokenFor } from "./router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean | null;
  children?: ReactNode;
};

export default function Link({ href, replace, scroll, prefetch: _prefetch, onClick, children, ...rest }: Props) {
  void _prefetch;
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href, { replace, scroll });
  };
  return (
    <a {...rest} href={"#" + tokenFor(splitHref(href).pathname)} onClick={handle}>
      {children}
    </a>
  );
}

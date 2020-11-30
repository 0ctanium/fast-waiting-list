// @ts-nocheck
import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import MuiLink, { LinkProps as MuiLinkProps } from '@material-ui/core/Link';

const NextComposed = React.forwardRef(function NextComposed(
  props: NextComposedProps,
  ref
) {
  const { as, href, localise, ...other } = props;

  return (
    <NextLink href={href} as={as}>
      <a ref={ref} {...other} />
    </NextLink>
  );
});

export interface NextComposedProps {
  as: string | Record<string, unknown>;
  href: string | Record<string, unknown>;
  prefetch: boolean;
  localise?: boolean;
}

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: LinkProps) {
  const {
    href,
    activeClassName = 'active',
    className: classNameProps,
    innerRef,
    naked,
    ...other
  } = props;

  const router = useRouter();
  const pathname = typeof href === 'string' ? href : href.pathname;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === pathname && activeClassName,
  });

  if (naked) {
    return (
      <NextComposed
        className={className}
        ref={innerRef}
        href={href}
        {...other}
      />
    );
  }

  return (
    <MuiLink
      component={NextComposed}
      className={className}
      ref={innerRef}
      href={href}
      {...other}
    />
  );
}

export type LinkProps = MuiLinkProps & {
  activeClassName?: string;
  as?: string | Record<string, unknown>;
  className?: string;
  href?: string | Record<string, unknown>;
  innerRef?: ((instance: unknown) => void) | React.MutableRefObject<unknown>;
  naked?: boolean;
  onClick?: (...args: any) => any;
  prefetch?: boolean;
  localise?: boolean;
};

export default React.forwardRef<unknown, LinkProps>((props, ref) => (
  <Link {...props} innerRef={ref} />
));

/** Stand-in for `next/dynamic`: React.lazy + Suspense with the same `loading` option. */
import { Suspense, lazy, type ComponentType } from "react";

type Loader<P> = () => Promise<{ default: ComponentType<P> } | ComponentType<P>>;

export default function dynamic<P extends object>(loader: Loader<P>, opts: { loading?: ComponentType; ssr?: boolean } = {}) {
  const Lazy = lazy(async () => {
    const mod = await loader();
    return { default: "default" in mod ? mod.default : mod };
  });
  const Loading = opts.loading;
  return function Dynamic(props: P) {
    return (
      <Suspense fallback={Loading ? <Loading /> : null}>
        <Lazy {...props} />
      </Suspense>
    );
  };
}

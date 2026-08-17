/**
 * Minimal React type shim for the client bundle. The DSH shell provides the
 * real `react` module at runtime; this file only lets the plugin typecheck
 * without pulling @types/react into the isolated plugin workspace.
 * @module dsh-deepseek-usage/client/react-shim
 */

declare module 'react' {
  export type ReactNode = unknown
  export function createElement(
    type: unknown,
    props?: Record<string, unknown> | null,
    ...children: unknown[]
  ): unknown
  export function useState<S>(initial: S | (() => S)): [S, (value: S | ((prev: S) => S)) => void]
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void
  export const Fragment: unknown
}

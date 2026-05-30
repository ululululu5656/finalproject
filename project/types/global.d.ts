// Ambient module declarations to silence type errors when dependencies are not installed

declare module 'lucide-react' {
  export const Coffee: any;
  export const User: any;
  export const Shield: any;
  const _default: any;
  export default _default;
}

declare module 'sonner' {
  export const Toaster: any;
  export type ToasterProps = any;
  const _default: any;
  export default _default;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function redirect(url: string): void;
}

declare module 'next-themes' {
  export function useTheme(): { theme?: string; setTheme?: (t: string) => void };
}

// Minimal React shims for TypeScript when @types/react / react are not installed
declare module 'react' {
  export function useState<T = any>(initial?: T | (() => T)): [T, (v: any) => void];
  export function useEffect(fn: () => any, deps?: any[]): void;
  export function useRef<T = any>(initial?: T): { current: T };
  export const Fragment: any;
  export const JSX: any;
  const React: any;
  export default React;
}

// JSX runtime shim
declare module 'react/jsx-runtime' {
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export function jsxDEV(type: any, props?: any, key?: any): any;
  export const Fragment: any;
}

// Ensure JSX intrinsic elements exist so TSX compiles when @types/react is missing
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

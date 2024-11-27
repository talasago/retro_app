// TODO: "vite-plugin-env-compatible"等を使って、process.envを読み込めるように変更したい。

export function getEnvVar(key: string): string | undefined {
  if (typeof import.meta?.env !== 'undefined') {
    return import.meta.env[key] as string | undefined;
  } else {
    return process.env[key];
  }
}

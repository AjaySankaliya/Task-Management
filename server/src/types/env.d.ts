declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: "error" | "warn" | "info" | "http" | "verbose" | "debug" | "silly";
    }
  }
}

export {};

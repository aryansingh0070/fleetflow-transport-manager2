import { Component, ReactNode } from "react";
import { captureException } from "../lib/sentry";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    captureException(error, { info: info.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="text-center text-sm">We reported the issue to our team and will fix it soon.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

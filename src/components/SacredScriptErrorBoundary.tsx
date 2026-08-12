import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface SacredScriptErrorBoundaryProps {
  children: ReactNode;
}

interface SacredScriptErrorBoundaryState {
  hasError: boolean;
}

export class SacredScriptErrorBoundary extends Component<
  SacredScriptErrorBoundaryProps,
  SacredScriptErrorBoundaryState
> {
  state: SacredScriptErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): SacredScriptErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Natal Script render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-xl py-16 text-center space-y-4">
          <h2 className="text-xl font-semibold">This chart could not be opened</h2>
          <p className="text-sm text-muted-foreground">
            Some saved chart details are missing. Your place in the app has been kept.
          </p>
          <Button onClick={() => this.setState({ hasError: false })}>Try again</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
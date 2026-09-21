import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Plain-language name of the area, e.g. "Natal Portrait". */
  sectionName: string;
}

interface State {
  error: Error | null;
}

/**
 * Keeps one section's failure inside that section instead of blanking the whole
 * app through the top-level boundary.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.sectionName}] section failed to render:`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="max-w-2xl mx-auto my-10 border border-border rounded-sm bg-card p-6 text-center">
          <p className="text-sm text-foreground">{this.props.sectionName} could not be displayed for this chart.</p>
          <p className="text-xs text-muted-foreground mt-2">
            Try picking a different chart, or re-save this one from the chart library. Everything else in the app still works.
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="mt-4 text-xs px-3 py-1.5 rounded-sm border border-border hover:bg-secondary/50 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default SectionErrorBoundary;

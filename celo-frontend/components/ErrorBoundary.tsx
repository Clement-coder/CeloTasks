"use client";
import { Component, type ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback ?? (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="text-red-400 font-semibold text-lg">Something went wrong</p>
          <p className="text-slate-500 text-sm max-w-sm">{this.state.error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="gradient-btn text-white text-sm font-semibold px-5 py-2.5 rounded-xl"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

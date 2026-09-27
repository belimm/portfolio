'use client';

import React from 'react';

type Props = { fallback: React.ReactNode; children: React.ReactNode };

/** If the PDF viewer crashes (old browser, blocked worker…), show a fallback instead of taking the page down. */
export default class ViewerBoundary extends React.Component<Props, { failed: boolean }> {
   state = { failed: false };

   static getDerivedStateFromError() {
      return { failed: true };
   }

   componentDidCatch(error: unknown) {
      console.error('CV viewer failed:', error);
   }

   render() {
      return this.state.failed ? this.props.fallback : this.props.children;
   }
}

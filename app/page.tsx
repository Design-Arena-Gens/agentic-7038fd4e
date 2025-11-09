"use client";

import dynamic from 'next/dynamic';

const WorkflowCanvas = dynamic(() => import('./components/WorkflowCanvas'), {
  ssr: false,
});

export default function Home() {
  return <WorkflowCanvas />;
}

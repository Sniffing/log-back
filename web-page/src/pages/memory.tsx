import * as React from "react";
import MemorySnippet from "../custom-components/memorySnippet";

export class MemoryPage extends React.Component {
  public render() {
    return (
      <div className="memory-page">
        <MemorySnippet />
      </div>
    );
  }
}

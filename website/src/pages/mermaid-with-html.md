---
id: mermaid-with-html
---


import { MermaidWithHtml, Nodes, Node, Connection, NodeDescriptions, NodeDescription } from '/src/components/MermaidWithHtml/MermaidWithHtml';

<MermaidWithHtml>
  <Nodes title="Lorem ipsum">
    <Node id="1">firstInput</Node>
    <Node id="2">secondInput</Node>
    <Node id="3">someFunction(firstInput, secondInput)</Node>
    <Node id="4">someDTO</Node>
    <Connection from="1" to="3" label="foo"/>
    <Connection from="2" to="3"/>
    <Connection from="3" to="4"/>
  </Nodes>
  <NodeDescriptions>
    <NodeDescription for='1'><code>firstInput</code> lorem ipsum.</NodeDescription>
    <NodeDescription for='2'><code>secondInput</code> lorem ipsum.</NodeDescription>
    <NodeDescription for='2'><code>someFunction</code> lorem ipsum lorem ipsum.</NodeDescription>
    <NodeDescription for='4'><code>someDTO</code> lorem ipsum.</NodeDescription>
  </NodeDescriptions>
</MermaidWithHtml>
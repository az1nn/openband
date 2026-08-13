export type NodeType = 'source' | 'route' | 'test' | 'spec' | 'external';
export type EdgeType = 'import' | 'route' | 'test' | 'specifies' | 'dynamic-import' | 'require';
export type ImpactRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GraphNode {
  id: string;
  path: string;
  type: NodeType;
  metadata?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: EdgeType;
  spec?: string;
}

export interface ArchitectureGraph {
  version: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

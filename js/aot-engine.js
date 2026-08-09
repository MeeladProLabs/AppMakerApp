/**
 * App Maker - Application Object Tree (AOT) Engine
 * Component definition catalog and layout tree operations.
 */

const AOTEngine = {
  components: {
    HEADER: {
      type: 'HEADER',
      category: 'Typography',
      label: 'Header Text',
      defaultProps: { text: 'Header Title', level: 'h2', color: '#ffffff' }
    },
    TEXT_INPUT: {
      type: 'TEXT_INPUT',
      category: 'Forms',
      label: 'Text Input',
      defaultProps: { label: 'Field Label', placeholder: 'Enter value...', required: false }
    },
    BUTTON: {
      type: 'BUTTON',
      category: 'Actions',
      label: 'Button',
      defaultProps: { text: 'Click Me', variant: 'primary', action: 'none' }
    },
    CONTAINER: {
      type: 'CONTAINER',
      category: 'Layout',
      label: 'Card Container',
      defaultProps: { padding: '1rem', backgroundColor: '#1e293b' }
    },
    TABLE: {
      type: 'TABLE',
      category: 'Data',
      label: 'Data Table',
      defaultProps: { columns: ['ID', 'Name', 'Status'], rows: [] }
    }
  },

  generateNodeId() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  },

  createNode(componentType) {
    const compDef = this.components[componentType];
    if (!compDef) throw new Error(`Unknown component type: ${componentType}`);

    return {
      id: this.generateNodeId(),
      type: compDef.type,
      props: JSON.parse(JSON.stringify(compDef.defaultProps)),
      children: []
    };
  },

  addNodeToTree(tree, newNode, parentId = null) {
    if (!parentId) {
      tree.push(newNode);
      return tree;
    }

    const traverse = (nodes) => {
      for (let node of nodes) {
        if (node.id === parentId) {
          if (!node.children) node.children = [];
          node.children.push(newNode);
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (traverse(node.children)) return true;
        }
      }
      return false;
    };

    traverse(tree);
    return tree;
  },

  removeNodeFromTree(tree, nodeId) {
    return tree.filter(node => {
      if (node.id === nodeId) return false;
      if (node.children && node.children.length > 0) {
        node.children = this.removeNodeFromTree(node.children, nodeId);
      }
      return true;
    });
  },

  findNode(tree, nodeId) {
    for (let node of tree) {
      if (node.id === nodeId) return node;
      if (node.children && node.children.length > 0) {
        const found = this.findNode(node.children, nodeId);
        if (found) return found;
      }
    }
    return null;
  }
};

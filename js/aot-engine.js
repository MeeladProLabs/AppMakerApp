/**
 * App Maker - Application Object Tree (AOT) Engine
 * Manages UI component definitions, JSON layout tree structures, and node operations.
 */

const AOTEngine = {
  // Component Palette Catalog
  components: {
    HEADER: {
      type: 'HEADER',
      category: 'Typography',
      label: 'Header Text',
      defaultProps: {
        text: 'Header Title',
        level: 'h2',
        color: '#ffffff'
      }
    },
    TEXT_INPUT: {
      type: 'TEXT_INPUT',
      category: 'Forms',
      label: 'Text Input',
      defaultProps: {
        label: 'Field Label',
        placeholder: 'Enter value...',
        required: false
      }
    },
    BUTTON: {
      type: 'BUTTON',
      category: 'Actions',
      label: 'Button',
      defaultProps: {
        text: 'Click Me',
        variant: 'primary',
        action: 'none'
      }
    },
    CONTAINER: {
      type: 'CONTAINER',
      category: 'Layout',
      label: 'Card Container',
      defaultProps: {
        padding: '1rem',
        backgroundColor: '#1e293b'
      }
    },
    TABLE: {
      type: 'TABLE',
      category: 'Data',
      label: 'Data Table',
      defaultProps: {
        columns: ['ID', 'Name', 'Status'],
        rows: []
      }
    }
  },

  /**
   * Generates a unique component instance ID.
   * @returns {string}
   */
  generateNodeId() {
    return 'node_' + Math.random().toString(36).substr(2, 9);
  },

  /**
   * Creates a new element node to append to an app's layout tree.
   * @param {string} componentType 
   * @returns {Object}
   */
  createNode(componentType) {
    const compDef = this.components[componentType];
    if (!compDef) {
      throw new Error(`Unknown component type: ${componentType}`);
    }

    return {
      id: this.generateNodeId(),
      type: compDef.type,
      props: JSON.parse(JSON.stringify(compDef.defaultProps)),
      children: []
    };
  },

  /**
   * Appends a node into an app layout array or parent container.
   * @param {Array} tree 
   * @param {Object} newNode 
   * @param {string|null} parentId 
   * @returns {Array} Updated tree
   */
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

  /**
   * Removes a node by ID from anywhere in the tree.
   * @param {Array} tree 
   * @param {string} nodeId 
   * @returns {Array} Updated tree
   */
  removeNodeFromTree(tree, nodeId) {
    return tree.filter(node => {
      if (node.id === nodeId) return false;
      if (node.children && node.children.length > 0) {
        node.children = this.removeNodeFromTree(node.children, nodeId);
      }
      return true;
    });
  },

  /**
   * Finds a node by ID in the tree.
   * @param {Array} tree 
   * @param {string} nodeId 
   * @returns {Object|null}
   */
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

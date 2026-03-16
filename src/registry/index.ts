import type { CapabilitySpec } from '../types/index.js';

interface RegistryItem {
  name: string;
  description: string;
  spec: CapabilitySpec;
}

interface Registry {
  identity: RegistryItem[];
  data: RegistryItem[];
  commerce: RegistryItem[];
  communication: RegistryItem[];
  infrastructure: RegistryItem[];
}

export const registry: Registry = {
  identity: [
    {
      name: 'authentication',
      description: 'User authentication with multiple strategies',
      spec: {
        capability: 'authentication',
        version: '1.0.0',
        description: 'Handle user authentication',
        category: 'identity',
        entities: {
          User: {
            id: 'string',
            email: 'string',
            passwordHash: 'string',
            createdAt: 'date',
            updatedAt: 'date',
          },
          Session: {
            id: 'string',
            userId: 'string',
            token: 'string',
            expiresAt: 'date',
          },
        },
        usecases: [
          'register',
          'login',
          'logout',
          'refreshToken',
          'resetPassword',
        ],
        events: [
          'user.registered',
          'user.logged_in',
          'user.logged_out',
          'password.reset_requested',
        ],
        ports: ['UserRepository', 'SessionRepository', 'PasswordHasher', 'TokenGenerator'],
      },
    },
    {
      name: 'authorization',
      description: 'Role-based access control',
      spec: {
        capability: 'authorization',
        version: '1.0.0',
        description: 'Manage user permissions and roles',
        category: 'identity',
        entities: {
          Role: {
            id: 'string',
            name: 'string',
            permissions: 'string[]',
          },
          Permission: {
            id: 'string',
            resource: 'string',
            action: 'string',
          },
        },
        usecases: ['assignRole', 'revokeRole', 'checkPermission'],
        events: ['role.assigned', 'role.revoked'],
        ports: ['RoleRepository', 'PermissionChecker'],
      },
    },
  ],
  data: [
    {
      name: 'crud-resources',
      description: 'Generic CRUD operations',
      spec: {
        capability: 'crud-resources',
        version: '1.0.0',
        description: 'Generic CRUD resource management',
        category: 'data',
        usecases: ['create', 'read', 'update', 'delete', 'list'],
        events: ['resource.created', 'resource.updated', 'resource.deleted'],
        ports: ['ResourceRepository'],
      },
    },
    {
      name: 'files',
      description: 'File upload and storage',
      spec: {
        capability: 'files',
        version: '1.0.0',
        description: 'Handle file uploads and storage',
        category: 'data',
        entities: {
          File: {
            id: 'string',
            name: 'string',
            mimeType: 'string',
            size: 'number',
            url: 'string',
            uploadedAt: 'date',
          },
        },
        usecases: ['uploadFile', 'downloadFile', 'deleteFile', 'listFiles'],
        events: ['file.uploaded', 'file.deleted'],
        ports: ['FileStorage', 'FileRepository'],
      },
    },
  ],
  commerce: [
    {
      name: 'cart',
      description: 'Shopping cart management',
      spec: {
        capability: 'cart',
        version: '1.0.0',
        description: 'Manage shopping carts',
        category: 'commerce',
        entities: {
          Cart: {
            id: 'string',
            userId: 'string',
            createdAt: 'date',
            updatedAt: 'date',
          },
          CartItem: {
            id: 'string',
            cartId: 'string',
            productId: 'string',
            quantity: 'number',
            price: 'number',
          },
        },
        usecases: [
          'createCart',
          'getCart',
          'addItem',
          'removeItem',
          'updateQuantity',
          'clearCart',
          'checkout',
        ],
        events: [
          'cart.created',
          'cart.item_added',
          'cart.item_removed',
          'cart.checked_out',
        ],
        ports: ['CartRepository', 'ProductCatalog'],
      },
    },
    {
      name: 'orders',
      description: 'Order processing and management',
      spec: {
        capability: 'orders',
        version: '1.0.0',
        description: 'Process and manage orders',
        category: 'commerce',
        entities: {
          Order: {
            id: 'string',
            userId: 'string',
            status: 'string',
            total: 'number',
            createdAt: 'date',
          },
          OrderItem: {
            id: 'string',
            orderId: 'string',
            productId: 'string',
            quantity: 'number',
            price: 'number',
          },
        },
        usecases: ['createOrder', 'getOrder', 'updateStatus', 'cancelOrder'],
        events: ['order.created', 'order.status_changed', 'order.cancelled'],
        ports: ['OrderRepository', 'PaymentProcessor'],
        dependencies: ['cart'],
      },
    },
  ],
  communication: [
    {
      name: 'notifications',
      description: 'Multi-channel notifications',
      spec: {
        capability: 'notifications',
        version: '1.0.0',
        description: 'Send notifications via multiple channels',
        category: 'communication',
        entities: {
          Notification: {
            id: 'string',
            userId: 'string',
            channel: 'string',
            subject: 'string',
            body: 'string',
            status: 'string',
            sentAt: 'date',
          },
        },
        usecases: ['sendNotification', 'getNotifications', 'markAsRead'],
        events: ['notification.sent', 'notification.read'],
        ports: ['NotificationRepository', 'EmailService', 'SMSService'],
      },
    },
  ],
  infrastructure: [
    {
      name: 'rate-limiting',
      description: 'API rate limiting',
      spec: {
        capability: 'rate-limiting',
        version: '1.0.0',
        description: 'Rate limit API requests',
        category: 'infrastructure',
        usecases: ['checkLimit', 'recordRequest'],
        ports: ['RateLimitStore'],
      },
    },
    {
      name: 'feature-flags',
      description: 'Feature flag management',
      spec: {
        capability: 'feature-flags',
        version: '1.0.0',
        description: 'Manage feature flags',
        category: 'infrastructure',
        entities: {
          FeatureFlag: {
            id: 'string',
            name: 'string',
            enabled: 'boolean',
            rolloutPercentage: 'number',
          },
        },
        usecases: ['isEnabled', 'toggleFlag', 'updateRollout'],
        events: ['flag.toggled', 'flag.rollout_changed'],
        ports: ['FeatureFlagRepository'],
      },
    },
  ],
};

export function getRegistry(): Registry {
  return registry;
}

export function getCapability(name: string): RegistryItem | undefined {
  for (const category of Object.values(registry)) {
    const found = category.find((cap: RegistryItem) => cap.name === name);
    if (found) return found;
  }
  return undefined;
}

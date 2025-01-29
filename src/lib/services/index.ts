// src/lib/services/index.ts

import { authService } from "./auth";
import { gumloopService } from "./gumloop";
import { firebaseService } from "./firebase";

// Re-export all services
export { authService } from "./auth";
export { gumloopService } from "./gumloop";
export { firebaseService } from "./firebase";

// Re-export service classes for type information
export { AuthService } from "./auth";
export { GumloopService } from "./gumloop";
export { FirebaseService } from "./firebase";

// Export a convenience object with all services
export const services = {
  auth: authService,
  gumloop: gumloopService,
  firebase: firebaseService,
} as const;

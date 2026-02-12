// @ts-nocheck
import { createRouter, createWebHistory, type NavigationGuardNext, type RouteLocationNormalized } from "vue-router";
import { middlewares } from "@/utils/dynamic-importer";
import NProgress from 'nprogress'

let routes: any[] = [];

const NotFound = () =>
    import("@/views/errors/NotFound.vue").then((m) => m.default || m);

import authRoutes from "./routes/authRoutes";
import pageRoutes from "./routes/pageRoutes";

routes = routes.concat(authRoutes, pageRoutes, {
    path: "/:catchAll(.*)",
    component: NotFound,
    meta: {
        layout: "default",
    },
});

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: "active current-page",
    routes,
});

router.beforeEach(beforeEach);

// Complete NProgress after navigation is done
router.afterEach(() => {
    try {
        if (typeof document !== 'undefined' && document.body) {
            NProgress.done();
        }
    } catch (e) {
        // Ignore
    }
});

// Complete NProgress on navigation error
router.onError(() => {
    try {
        if (typeof document !== 'undefined' && document.body) {
            NProgress.done();
        }
    } catch (e) {
        // Ignore
    }
});

export default router;

// Global middleware applied to all routes
const globalMiddleware: string[] = ["check-auth"];

// Dynamically loaded middleware modules
const routeMiddleware = middlewares;

/**
 * Global router guard.
 *
 * @param to - Target route
 * @param from - Current route
 * @param next - Navigation function
 */
function beforeEach(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void {
    // Safely start NProgress
    try {
        if (typeof document !== 'undefined' && document.body) {
            NProgress.start();
        }
    } catch (e) {
        // NProgress not ready yet, ignore
    }
    
    const components = to.matched;

    if (components.length === 0) {
        return next();
    }

    const middleware = getMiddleware(components);

    callMiddleware(middleware, to, from, (...args) => {
        next(...args);
    });
}

/**
 * Calls middleware in sequence.
 *
 * @param middleware - Middleware array
 * @param to - Target route
 * @param from - Current route
 * @param next - Navigation function
 */
function callMiddleware(
    middleware: (string | Function)[],
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
): void {
    const stack = [...middleware].reverse();

    const _next = (...args: any[]): void => {
        if (args.length > 0 || stack.length === 0) {
            return next(...args);
        }

        const mw = stack.pop();

        if (typeof mw === "function") {
            mw(to, from, _next);
        } else if (mw && routeMiddleware[mw]) {
            routeMiddleware[mw](to, from, _next);
        } else {
            throw new Error(`Undefined middleware [${mw}]`);
        }
    };

    _next();
}

/**
 * Combine global middleware and per-route middleware.
 *
 * @param components - Matched route components
 * @returns Array of middleware names/functions
 */
function getMiddleware(
    components: RouteLocationNormalized["matched"]
): (string | Function)[] {
    const middlewaresArr: (string | Function)[] = [...globalMiddleware];

    components.forEach((c) => {
        if (c.meta.middleware) {
            const mw = c.meta.middleware;
            if (Array.isArray(mw)) {
                middlewaresArr.push(...mw);
            } else {
                middlewaresArr.push(mw);
            }
        }
    });

    return middlewaresArr;
}

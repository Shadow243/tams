import type { Component } from 'vue'
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

type Middleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => void

const resolveLayouts = (): Record<string, Component> => {
  const layoutsGlob = import.meta.glob('./../layouts/*.vue', { eager: true })
  const layouts: Record<string, Component> = {}

  for (const path in layoutsGlob) {
    const componentName = path.replace(/(^.\/)|(\.vue$)/g, '')
    const name = componentName.slice(componentName.lastIndexOf('/') + 1)
    const component = layoutsGlob[path]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    layouts[name] = (component as any).default || component
  }

  return layouts
}

const resolveMiddleware = (): Record<string, Middleware> => {
  const middlewaresGlob = import.meta.glob('./../middleware/*.ts', { eager: true })
  const middlewares: Record<string, Middleware> = {}

  for (const path in middlewaresGlob) {
    const componentName = path.replace(/(^\.\/)|(\.ts|\.js)$/g, '')
    const name = componentName.slice(componentName.lastIndexOf('/') + 1)
    const middleware = middlewaresGlob[path]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    middlewares[name] = (middleware as any).default || middleware
  }

  return middlewares
}

const dynamicPage = (path: string): (() => Promise<Component>) => {
  return () =>
    import(`./../views/${path}.vue`).then((m) => m.default || m)
}

const middlewares = resolveMiddleware()
const layouts = resolveLayouts()

export { layouts, middlewares, dynamicPage }